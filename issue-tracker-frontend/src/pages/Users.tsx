import React, { useState, useEffect } from 'react';
import { Search, Trash2, User as UserIcon, ShieldAlert } from 'lucide-react';
import api from '../api/axios';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'DEVELOPER' | 'USER';
}

const ROLE_COLORS = {
  ADMIN: 'text-red-400 bg-red-400/10 border-red-400/20',
  DEVELOPER: 'text-primary bg-primary/10 border-primary/20',
  USER: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
        alert("You cannot delete your own account.");
        return;
    }
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Make sure you have administrative privileges.');
      }
    }
  };

  const handleRoleUpdate = async (id: number, newRole: string) => {
      try {
          await api.put(`/users/${id}`, { role: newRole });
          fetchUsers();
      } catch (error) {
          console.error('Error updating role:', error);
          alert('Failed to update user role.');
      }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentUser?.role !== 'ADMIN') {
      return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] space-y-4">
              <ShieldAlert className="w-16 h-16 text-red-500/50" />
              <h2 className="text-2xl font-bold text-slate-100">Access Denied</h2>
              <p className="text-slate-400">You must be an Administrator to manage users.</p>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-100">Users Management</h2>
        <p className="text-slate-400 mt-1">Manage user accounts and system roles.</p>
      </header>

      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
        <input 
          className="input-field w-full pl-12 h-12 bg-white/5 border-white/5 hover:border-white/10"
          placeholder="Search by name or email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mr-3 border border-white/5 group-hover:border-primary/30 transition-colors">
                      <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-bold text-slate-200">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-sm text-slate-400">
                  {u.email}
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center space-x-2">
                    <select 
                        value={u.role}
                        onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                        className={clsx(
                            'text-xs font-bold px-3 py-1.5 rounded-xl border appearance-none cursor-pointer hover:scale-105 transition-transform bg-transparent outline-none ring-primary/20 focus:ring-4',
                            ROLE_COLORS[u.role]
                        )}
                    >
                        <option value="USER" className="bg-slate-900 text-slate-100">User</option>
                        <option value="DEVELOPER" className="bg-slate-900 text-slate-100">Developer</option>
                        <option value="ADMIN" className="bg-slate-900 text-slate-100">Admin</option>
                    </select>
                  </div>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className={clsx(
                          "p-2 rounded-lg transition-all",
                          u.id === currentUser?.id ? "opacity-20 cursor-not-allowed" : "hover:bg-red-500/20 hover:text-red-500 text-slate-500"
                      )}
                      disabled={u.id === currentUser?.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
