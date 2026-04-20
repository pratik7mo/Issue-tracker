import React, { useState } from 'react';
import { User as UserIcon, Lock, Bell, Moon, Globe, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { clsx } from 'clsx';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: UserIcon },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell },
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Assuming a generic user update endpoint that can be used for self
      await api.put(`/users/${user?.id}`, { name: profileName });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      // Assuming change-password logic is implemented at the backend
      // Using existing AuthService changePassword logic if available
      // For now, using a structured PUT if needed
      alert('Password change logic requires dedicated backend endpoint /api/auth/change-password');
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-100 uppercase tracking-tighter italic">Settings</h2>
        <p className="text-slate-400 mt-1">Manage your account preferences and security.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setMessage(null); }}
              className={clsx(
                'w-full flex items-center px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          {message && (
            <div className={clsx(
              "p-4 rounded-xl mb-6 text-sm font-bold animate-in fade-in zoom-in",
              message.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input 
                  className="input-field" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input 
                  className="input-field opacity-50 cursor-not-allowed" 
                  value={user?.email} 
                  disabled 
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary flex items-center px-8 py-3"
                disabled={loading}
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                <input 
                   type="password"
                   className="input-field" 
                   value={oldPassword} 
                   onChange={(e) => setOldPassword(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                    <input 
                        type="password"
                        className="input-field" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                    <input 
                        type="password"
                        className="input-field" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn-primary flex items-center px-8 py-3"
                disabled={loading}
              >
                <Lock className="w-5 h-5 mr-2" />
                Update Password
              </button>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                 <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                        <Moon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-200">Dark Mode</h4>
                        <p className="text-xs text-slate-500">Toggle system-wide dark theme</p>
                    </div>
                 </div>
                 <div className="w-12 h-6 bg-primary rounded-full relative">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                 </div>
              </div>

               <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                 <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mr-4">
                        <Bell className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-200">Email Notifications</h4>
                        <p className="text-xs text-slate-500">Get notified about issue updates</p>
                    </div>
                 </div>
                 <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                 </div>
              </div>

               <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                 <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mr-4">
                        <Globe className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-200">Language</h4>
                        <p className="text-xs text-slate-500">English (United States)</p>
                    </div>
                 </div>
                 <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Change</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
