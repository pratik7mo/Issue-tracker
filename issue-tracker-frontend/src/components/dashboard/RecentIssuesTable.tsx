import React from 'react';
import { Eye, ExternalLink, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import type { Issue } from '../../types';
import { format } from 'date-fns';

interface RecentIssuesTableProps {
    issues: Issue[];
    isLoading?: boolean;
}

const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
        default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'in_progress': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
        case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'closed': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
};

const RecentIssuesTable: React.FC<RecentIssuesTableProps> = ({ issues, isLoading }) => {
    if (isLoading) {
        return <div className="glass h-[400px] p-8 rounded-3xl border border-white/5 animate-pulse bg-white/5" />;
    }

    if (issues.length === 0) {
        return (
            <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-slate-500 h-[400px]">
                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <p>No Issues Found</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    Recently Created Issues
                </h3>
                <span className="text-xs font-bold text-slate-500 uppercase">Showing last 5</span>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <th className="px-8 py-4">Issue ID</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {issues.map((issue) => (
                            <tr key={issue.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                <td className="px-8 py-4">
                                    <span className="text-sm font-bold text-primary group-hover:underline">#ISSUE-{issue.id}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-200 truncate max-w-[200px]">{issue.title}</span>
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                            <Calendar className="w-3 h-3" /> {format(new Date(issue.createdAt), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getPriorityColor(issue.priority)}`}>
                                        {issue.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(issue.status)}`}>
                                        {issue.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center">
                                        <button className="p-2 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all group/btn">
                                            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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

export default RecentIssuesTable;
