import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Ticket, Clock, CheckCircle, AlertOctagon } from 'lucide-react';
import api from '../api/axios';
import type { DashboardStats, UserLeaderboard } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, leaderboardRes] = await Promise.all([
          api.get('/issues/stats'),
          api.get('/issues/leaderboard')
        ]);
        setStats(statsRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Issues', value: stats.totalIssues, icon: Ticket, color: 'text-primary' },
    { label: 'Open', value: stats.statusDistribution['OPEN'] || 0, icon: Clock, color: 'text-yellow-500' },
    { label: 'In Progress', value: stats.inProgressIssues, icon: AlertOctagon, color: 'text-blue-500' },
    { label: 'Resolved', value: stats.resolvedIssues, icon: CheckCircle, color: 'text-green-500' },
    { label: 'High Priority', value: stats.highPriorityIssues, icon: AlertOctagon, color: 'text-red-500' },
  ];

  const typeData = Object.entries(stats.typeDistribution).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(stats.statusDistribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-100">Overview</h2>
        <p className="text-slate-400 mt-1">Real-time performance and distribution analytics.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300 group bg-gradient-to-br from-white/5 to-white/0 hover:to-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium">{card.label}</p>
            <h3 className="text-3xl font-bold text-slate-100 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts Section */}
        <div className="glass p-8 rounded-3xl border border-white/5 h-[400px]">
          <h3 className="text-xl font-bold text-slate-100 mb-6">Issue Type Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={typeData}>
               <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
               <XAxis dataKey="name" stroke="#94a3b8" />
               <YAxis stroke="#94a3b8" />
               <Tooltip 
                 contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                 cursor={{ fill: 'rgba(255,255,255,0.05)' }}
               />
               <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5 h-[400px]">
          <h3 className="text-xl font-bold text-slate-100 mb-6">Status Overview</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
              >
                {statusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass p-8 rounded-3xl border border-white/5">
        <h3 className="text-xl font-bold text-slate-100 mb-6">Resolvers Leaderboard</h3>
        <div className="space-y-4">
          {leaderboard.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary mr-4">
                  #{index + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  <span className="text-xs text-slate-500">{item.email}</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary mr-2">{item.resolvedCount}</span>
                <span className="text-sm text-slate-500">issues resolved</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
