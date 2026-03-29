import React from 'react';
import { Trophy, Medal, Award, User, Timer } from 'lucide-react';
import type { UserLeaderboard } from '../../types';

interface LeaderboardCardProps {
    leaderboard: UserLeaderboard[];
    isLoading?: boolean;
}

const getRankIcon = (index: number) => {
    switch (index) {
        case 0: return <Trophy className="w-5 h-5 text-yellow-400" />;
        case 1: return <Medal className="w-5 h-5 text-slate-300" />;
        case 2: return <Award className="w-5 h-5 text-orange-400" />;
        default: return null;
    }
};

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ leaderboard, isLoading }) => {
    if (isLoading) {
        return <div className="glass h-[400px] p-8 rounded-3xl border border-white/5 animate-pulse bg-white/5" />;
    }

    return (
        <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Resolvers Leaderboard
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">Top 5</span>
            </div>

            <div className="space-y-4">
                {leaderboard.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-all duration-300 group">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-slate-400 shadow-xl overflow-hidden group-hover:border-primary/40 transition-colors">
                                    <User className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="absolute -top-1 -right-1">
                                    {getRankIcon(index)}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-200 group-hover:text-primary transition-colors">{item.name}</span>
                                <span className="text-[10px] font-semibold text-slate-500 tracking-wider flex items-center gap-1 mt-1 uppercase">
                                    <Timer className="w-3 h-3" /> Avg 2.4h
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-slate-100">{item.resolvedCount}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Resolved</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardCard;
