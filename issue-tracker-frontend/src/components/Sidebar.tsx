import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, LogOut, User as UserIcon,
  Users, BarChart3, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Issues', icon: Ticket, path: '/issues' },
    { name: 'Users', icon: Users, path: '/users' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen glass border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent italic tracking-tighter">
          IssueTracker
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 hover:translate-x-1'
              )
            }
          >
            <item.icon className={clsx(
              "w-5 h-5 mr-3 transition-colors",
              "group-hover:text-primary"
            )} />
            <span className="font-bold text-sm tracking-wide">{item.name}</span>
            {/* Active Glow Indicator */}
            <div className={clsx(
              "absolute left-0 w-1 h-6 bg-primary rounded-r-full transition-transform duration-300",
              "translate-x-[-100%]" // Placeholder for active logic if NavLink doesn't support it directly in class
            )} />
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="flex items-center p-4 rounded-3xl bg-white/5 border border-white/5 overflow-hidden group hover:bg-white/10 transition-colors">
          <div className="bg-primary/20 p-2.5 rounded-xl mr-3 group-hover:scale-110 transition-transform">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-100 truncate uppercase tracking-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate font-bold">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-6 py-3.5 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group font-bold text-sm"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
