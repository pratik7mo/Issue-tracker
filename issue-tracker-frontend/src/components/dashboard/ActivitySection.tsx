import {
    Activity as ActivityIcon, MessageSquare, PlusCircle,
    RefreshCw, CheckCircle2, UserPlus, AlertTriangle
} from 'lucide-react';
import type { Activity } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface ActivitySectionProps {
    activities: Activity[];
    isLoading?: boolean;
}

const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
        case 'created': return PlusCircle;
        case 'assigned': return UserPlus;
        case 'status updated': return RefreshCw;
        case 'priority changed': return AlertTriangle;
        case 'resolved': return CheckCircle2;
        default: return MessageSquare;
    }
};

const ActivitySection: React.FC<ActivitySectionProps> = ({ activities, isLoading }) => {
    if (isLoading) {
        return <div className="glass h-[400px] p-8 rounded-3xl border border-white/5 animate-pulse bg-white/5" />;
    }

    if (activities.length === 0) {
        return (
            <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-slate-500 h-[400px]">
                <ActivityIcon className="w-12 h-12 mb-4 opacity-20" />
                <p>No Activity Available</p>
            </div>
        );
    }

    return (
        <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-primary" />
                    Recent Activity
                </h3>
                <button className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>

            <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                {activities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.action);
                    return (
                        <div key={index} className="flex gap-4 relative group">
                            <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center relative z-10 shrink-0 group-hover:border-primary/40 transition-colors shadow-xl">
                                <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1 pt-1 pb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-slate-200">
                                        <span className="font-bold text-primary">#ISSUE-{activity.issueId}</span>
                                        <span className="mx-2 text-slate-500">•</span>
                                        <span className="text-slate-400">{activity.action}</span>
                                    </p>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                                        {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivitySection;
