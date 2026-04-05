import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import api from '../api/axios';
import { LayoutDashboard, Download, Filter } from 'lucide-react';

interface Stats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  highPriorityIssues: number;
  criticalIssues: number;
  overdueIssues: number;
  unassignedIssues: number;
  typeDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/summary');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching report stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusData = Object.entries(stats.statusDistribution).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  const priorityData = Object.entries(stats.priorityDistribution).map(([name, value]) => ({ name, value }));
  const typeData = Object.entries(stats.typeDistribution).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 uppercase tracking-tighter italic">Analytics Reports</h2>
          <p className="text-slate-400 mt-1">Comprehensive overview of system performance and issue tracking.</p>
        </div>
        <div className="flex gap-3">
            <button className="glass px-4 py-2 rounded-xl text-slate-400 flex items-center hover:text-white transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filter
            </button>
            <button className="btn-primary px-4 py-2 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
            </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Issues', value: stats.totalIssues, color: 'from-blue-500/20 to-indigo-500/20' },
          { label: 'Unassigned', value: stats.unassignedIssues, color: 'from-orange-500/20 to-red-500/20' },
          { label: 'Critical/High', value: stats.criticalIssues + stats.highPriorityIssues, color: 'from-red-500/20 to-pink-500/20' },
          { label: 'Resolved', value: stats.resolvedIssues, color: 'from-emerald-500/20 to-teal-500/20' },
        ].map((card, i) => (
          <div key={i} className={`glass p-6 rounded-3xl border border-white/5 bg-gradient-to-br ${card.color} relative overflow-hidden group hover:scale-[1.02] transition-all`}>
             <div className="relative z-10">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{card.label}</p>
                <h3 className="text-4xl font-black text-slate-100 tabular-nums">{card.value}</h3>
             </div>
             <LayoutDashboard className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:text-white/10 transition-colors rotate-12" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="glass p-8 rounded-[2rem] border border-white/5">
          <h3 className="text-xl font-bold text-slate-200 mb-8 flex items-center">
             <div className="w-2 h-6 bg-primary rounded-full mr-3" />
             Status Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Level */}
        <div className="glass p-8 rounded-[2rem] border border-white/5">
          <h3 className="text-xl font-bold text-slate-200 mb-8 flex items-center">
             <div className="w-2 h-6 bg-orange-500 rounded-full mr-3" />
             Priority Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

         {/* Issue Types */}
         <div className="glass p-8 rounded-[2rem] border border-white/5 lg:col-span-2">
          <h3 className="text-xl font-bold text-slate-200 mb-8 flex items-center">
             <div className="w-2 h-6 bg-emerald-500 rounded-full mr-3" />
             Issue Type Trends
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={typeData}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
