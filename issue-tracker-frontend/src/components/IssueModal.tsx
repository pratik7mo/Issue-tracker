import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Issue, IssueRequestDto, User, Priority, Status, IssueType } from '../types';
import api from '../api/axios';

interface IssueModalProps {
  issue?: Issue | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES: Status[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const TYPES: IssueType[] = [
  'BUG', 'TASK', 'PROBLEM', 'DEFECT', 'CRITICAL', 'IMPROVEMENT',
  'HARDWARE_VALIDATION', 
  'FIRMWARE_BUG', 
  'SYSTEM_INTEGRATION', 
  'PRODUCTION_YIELD', 
  'PERFORMANCE_OPTIMIZATION'
];

const IssueModal: React.FC<IssueModalProps> = ({ issue, onClose, onSuccess }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Partial<IssueRequestDto>>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    issueType: 'SYSTEM_INTEGRATION',
    status: 'OPEN',
    assignedToUserId: undefined,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();

    if (issue) {
      setFormData({
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        issueType: issue.issueType,
        status: issue.status,
        assignedToUserId: issue.assignedToUserId || undefined,
      });
    }
  }, [issue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (issue) {
        await api.put(`/issues/${issue.id}`, formData);
      } else {
        await api.post('/issues', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving issue:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-slate-100">{issue ? 'Edit Issue' : 'New Issue'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Issue Title</label>
            <input
              required
              className="input-field w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be fixed?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
            <textarea
              className="input-field w-full h-32 resize-none py-3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide more context..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Type</label>
              <select
                className="input-field w-full appearance-none"
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value as IssueType })}
              >
                {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Priority</label>
              <select
                className="input-field w-full appearance-none"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Status</label>
            <select
              className="input-field w-full appearance-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Assignee</label>
            <select
              className="input-field w-full appearance-none"
              value={formData.assignedToUserId || ''}
              onChange={(e) => setFormData({ ...formData, assignedToUserId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-semibold hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary py-3 font-semibold">
              {issue ? 'Update Issue' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueModal;
