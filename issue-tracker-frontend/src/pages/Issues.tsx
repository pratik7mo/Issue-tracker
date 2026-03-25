import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Tag, User as UserIcon } from 'lucide-react';
import api from '../api/axios';
import type { Issue, Status, Priority } from '../types';
import IssueModal from '../components/IssueModal';
import { clsx } from 'clsx';

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_COLORS: Record<Status, string> = {
  OPEN: 'bg-slate-500/10 text-slate-400',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
  RESOLVED: 'bg-green-500/10 text-green-400',
  CLOSED: 'bg-slate-700/50 text-slate-500',
};

const Issues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [search, setSearch] = useState('');

  const fetchIssues = async () => {
    try {
      const res = await api.get('/issues');
      setIssues(res.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await api.delete(`/issues/${id}`);
        fetchIssues();
      } catch (error) {
        console.error('Error deleting issue:', error);
      }
    }
  };

  const filteredIssues = issues.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) || 
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Issues</h2>
          <p className="text-slate-400 mt-1">Manage and track your project tasks.</p>
        </div>
        <button 
          onClick={() => { setSelectedIssue(null); setModalOpen(true); }}
          className="btn-primary flex items-center px-6 py-3"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Issue
        </button>
      </header>

      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input 
            className="input-field w-full pl-12 h-12 bg-white/5 border-white/5 hover:border-white/10"
            placeholder="Search issues by title or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="glass px-4 py-2 rounded-xl border border-white/5 text-slate-400 hover:text-slate-200 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Issue</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredIssues.map((issue) => (
              <tr key={issue.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-6">
                  <div>
                    <h4 className="font-semibold text-slate-200 group-hover:text-primary transition-colors">{issue.title}</h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{issue.description}</p>
                    <div className="flex items-center mt-2 gap-3">
                       <span className="flex items-center text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded uppercase border border-white/5">
                         <Tag className="w-3 h-3 mr-1" />
                         {issue.issueType.replace('_', ' ')}
                       </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className={clsx('px-3 py-1 rounded-full text-xs font-bold', STATUS_COLORS[issue.status])}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-6">
                   <span className={clsx('px-3 py-1 rounded-lg text-xs font-bold border', PRIORITY_COLORS[issue.priority])}>
                    {issue.priority}
                  </span>
                </td>
                <td className="px-6 py-6 text-sm text-slate-400">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-2 border border-slate-700">
                       <UserIcon className="w-4 h-4" />
                    </div>
                    <span>{issue.assignedTo || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => { setSelectedIssue(issue); setModalOpen(true); }}
                      className="p-2 hover:bg-primary/20 hover:text-primary text-slate-500 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(issue.id)}
                      className="p-2 hover:bg-red-500/20 hover:text-red-500 text-slate-500 rounded-lg transition-all"
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

      {modalOpen && (
        <IssueModal 
          issue={selectedIssue} 
          onClose={() => setModalOpen(false)} 
          onSuccess={fetchIssues} 
        />
      )}
    </div>
  );
};

export default Issues;
