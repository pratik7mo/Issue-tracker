import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
    trend?: {
        value: number;
        isUpward: boolean;
    };
    isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
    label, value, icon: Icon, color, trend, isLoading
}) => {
    if (isLoading) {
        return (
            <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-white/0 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl" />
                </div>
                <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                <div className="h-8 w-16 bg-white/10 rounded" />
            </div>
        );
    }

    return (
        <div className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300 group bg-gradient-to-br from-white/5 to-white/0 hover:to-primary/5 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between mb-4">
                <div className={clsx("p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform shadow-inner", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={clsx(
                        "text-xs font-bold px-2 py-1 rounded-lg",
                        trend.isUpward ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                        {trend.isUpward ? '+' : '-'}{trend.value}%
                    </span>
                )}
            </div>
            <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase opacity-70">{label}</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
            </div>
        </div>
    );
};

export default StatCard;
