import React, { useState, useEffect } from 'react';
import {
  Plus, Filter, Download,
  Ticket, Clock, CheckCircle2, AlertTriangle, AlertCircle,
  Activity as ActivityIcon, Calendar
} from 'lucide-react';
import api from '../api/axios';
import type { DashboardStats, UserLeaderboard } from '../types';
import StatCard from '../components/dashboard/StatCard';
import AssignedIssuesCard from '../components/dashboard/AssignedIssuesCard';
import ActivitySection from '../components/dashboard/ActivitySection';
import RecentIssuesTable from '../components/dashboard/RecentIssuesTable';
import LeaderboardCard from '../components/dashboard/LeaderboardCard';
import Charts from '../components/dashboard/Charts';

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

  const typeData = stats ? Object.entries(stats.typeDistribution).map(([name, value]) => ({ name, value })) : [];
  const statusData = stats ? Object.entries(stats.statusDistribution).map(([name, value]) => ({ name, value })) : [];
  const priorityData = stats ? Object.entries(stats.priorityDistribution).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-100 tracking-tight">Executive Dashboard</h2>
          <p className="text-slate-400 mt-1 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="glass px-4 py-2.5 rounded-xl text-slate-300 font-bold text-sm flex items-center gap-2 hover:bg-white/10 border-white/5 transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="glass px-4 py-2.5 rounded-xl text-slate-300 font-bold text-sm flex items-center gap-2 hover:bg-white/10 border-white/5 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="btn-primary">
            <Plus className="w-5 h-5" /> Create Issue
          </button>
        </div>
      </div>

      {/* Row 1: Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          label="Total Issues" value={stats?.totalIssues || 0}
          icon={Ticket} color="text-primary" isLoading={loading}
          trend={{ value: 12, isUpward: true }}
        />
        <StatCard
          label="Open Issues" value={stats?.openIssues || 0}
          icon={Clock} color="text-yellow-500" isLoading={loading}
        />
        <StatCard
          label="In Progress" value={stats?.inProgressIssues || 0}
          icon={ActivityIcon} color="text-blue-500" isLoading={loading}
        />
        <StatCard
          label="Resolved" value={stats?.resolvedIssues || 0}
          icon={CheckCircle2} color="text-emerald-500" isLoading={loading}
          trend={{ value: 8, isUpward: true }}
        />
        <StatCard
          label="High Priority" value={stats?.highPriorityIssues || 0}
          icon={AlertTriangle} color="text-orange-500" isLoading={loading}
        />
        <StatCard
          label="Overdue" value={stats?.overdueIssues || 0}
          icon={AlertCircle} color="text-red-500" isLoading={loading}
        />
      </div>

      {/* Row 2: Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Charts title="Issue Type Distribution" data={typeData} type="bar" isLoading={loading} />
        <Charts title="Status Overview" data={statusData} type="donut" isLoading={loading} />
      </div>

      {/* Row 3: Priority Dist & My Assigned */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Charts title="Priority Distribution" data={priorityData} type="pie" isLoading={loading} />
        <div className="lg:col-span-2">
          <AssignedIssuesCard stats={stats?.myAssignedIssues || { totalAssigned: 0, openCount: 0, inProgressCount: 0, overdueCount: 0 }} isLoading={loading} />
        </div>
      </div>

      {/* Row 4: Recent Activity */}
      <div className="grid grid-cols-1 gap-8">
        <ActivitySection activities={stats?.recentActivity || []} isLoading={loading} />
      </div>

      {/* Row 5: Recently Created Issues Table */}
      <div className="grid grid-cols-1 gap-8">
        <RecentIssuesTable issues={stats?.recentlyCreatedIssues || []} isLoading={loading} />
      </div>

      {/* Row 6: Resolver Leaderboard */}
      <div className="grid grid-cols-1 gap-8">
        <LeaderboardCard leaderboard={leaderboard} isLoading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
