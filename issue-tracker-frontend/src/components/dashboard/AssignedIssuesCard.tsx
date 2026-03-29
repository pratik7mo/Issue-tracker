import React from 'react';
import { UserCheck, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { MyAssignedStats } from '../../types';

interface AssignedIssuesCardProps {
    stats: MyAssignedStats;
    isLoading?: boolean;
}

const AssignedIssuesCard: React.FC<AssignedIssuesCardProps> = ({ stats, isLoading }) => {
    if (isLoading) {
        return <div className="glass h-full p-6 rounded-3xl border border-white/5 animate-pulse bg-white/5" />;
    }

    const items = [
        { label: 'Total Assigned', value: stats.totalAssigned, icon: UserCheck, color: 'text-primary' },
        { label: 'Open', value: stats.openCount, icon: Clock, color: 'text-yellow-500' },
        { label: 'In Progress', value: stats.inProgressCount, icon: CheckCircle2, color: 'text-blue-500' },
        { label: 'Overdue', value: stats.overdueCount, icon: AlertTriangle, color: 'text-red-500' },
    ];

    return (
        <div className="glass p-6 rounded-3xl border border-white/5 h-full bg-gradient-to-br from-white/5 to-transparent">
            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                My Assigned Issues
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {items.map((item) => (
                    <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-100">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignedIssuesCard;
