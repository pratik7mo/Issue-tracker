import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import api from '../api/axios';
import { LayoutDashboard, Download, Filter, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  recentActivity: Array<{
    id: number;
    userEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string;
    createdAt: string;
  }>;
  recentlyCreatedIssues: Array<{
    id: number;
    issueId: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`issue-tracker-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={reportRef} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 p-2">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight italic">Analytics</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">System Performance Overview</p>
        </div>
        <div className="flex gap-2">
            <button className="glass px-3 py-1.5 rounded-lg text-slate-400 flex items-center hover:text-white transition-colors text-xs font-bold">
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Filter
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary px-3 py-1.5 flex items-center text-xs font-bold disabled:opacity-50"
            >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {isExporting ? 'Exporting...' : 'Export'}
            </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.totalIssues, color: 'from-blue-500/20 to-indigo-500/20' },
          { label: 'Unassigned', value: stats.unassignedIssues, color: 'from-orange-500/20 to-red-500/20' },
          { label: 'Priority', value: stats.criticalIssues + stats.highPriorityIssues, color: 'from-red-500/20 to-pink-500/20' },
          { label: 'Resolved', value: stats.resolvedIssues, color: 'from-emerald-500/20 to-teal-500/20' },
        ].map((card, i) => (
          <div key={i} className={`glass p-3 rounded-2xl border border-white/5 bg-gradient-to-br ${card.color} relative overflow-hidden group hover:translate-y-[-2px] transition-all`}>
             <div className="relative z-10 flex flex-col">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">{card.label}</p>
                <h3 className="text-xl font-black text-slate-100 tabular-nums">{card.value}</h3>
             </div>
             <LayoutDashboard className="absolute -right-2 -bottom-2 w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors rotate-12" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Status Distribution */}
        <div className="glass p-4 rounded-2xl border border-white/5">
          <h3 className="text-xs font-black text-slate-400 mb-4 flex items-center uppercase tracking-widest">
             <div className="w-1.5 h-4 bg-primary rounded-full mr-2" />
             Status
          </h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ color: '#fff', padding: '2px 0' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Level */}
        <div className="glass p-4 rounded-2xl border border-white/5">
          <h3 className="text-xs font-black text-slate-400 mb-4 flex items-center uppercase tracking-widest">
             <div className="w-1.5 h-4 bg-orange-500 rounded-full mr-2" />
             Priority
          </h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} fontWeight="bold" />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

         {/* Issue Types */}
         <div className="glass p-4 rounded-2xl border border-white/5">
          <h3 className="text-xs font-black text-slate-400 mb-4 flex items-center uppercase tracking-widest">
             <div className="w-1.5 h-4 bg-emerald-500 rounded-full mr-2" />
             Trends
          </h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={typeData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={9} fontWeight="bold" />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity Section */}
        <div className="glass p-5 rounded-2xl border border-white/5 bg-slate-900/40">
           <h3 className="text-xs font-black text-slate-400 mb-4 flex items-center uppercase tracking-widest">
             <div className="w-1.5 h-4 bg-primary rounded-full mr-2" />
             Recent System Activity
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="mt-1 p-1.5 rounded-lg bg-primary/20 text-primary">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300">
                      <span className="font-bold text-slate-100">{activity.userEmail}</span> {activity.action} {activity.entityType}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center">
                      {activity.details} • {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-4 text-center">No recent activity recorded.</p>
            )}
          </div>
        </div>

        {/* Recently Created Issues Section */}
        <div className="glass p-5 rounded-2xl border border-white/5 bg-slate-900/40">
          <h3 className="text-xs font-black text-slate-400 mb-4 flex items-center uppercase tracking-widest">
             <div className="w-1.5 h-4 bg-emerald-500 rounded-full mr-2" />
             Latest Issues
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-tighter">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentlyCreatedIssues && stats.recentlyCreatedIssues.length > 0 ? (
                  stats.recentlyCreatedIssues.map((issue) => (
                    <tr key={issue.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono text-primary font-bold">{issue.issueId}</td>
                      <td className="py-3 text-slate-100 font-medium truncate max-w-[150px]">{issue.title}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 uppercase">
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/10 uppercase ${
                          issue.priority === 'CRITICAL' ? 'text-red-400 bg-red-400/10' :
                          issue.priority === 'HIGH' ? 'text-orange-400 bg-orange-400/10' :
                          'text-slate-400 bg-slate-400/10'
                        }`}>
                          {issue.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 italic">No recent issues found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
