import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface ChartCardProps {
    title: string;
    data: any[];
    type: 'bar' | 'pie' | 'donut';
    isLoading?: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
const PRIORITY_COLORS: Record<string, string> = {
    'CRITICAL': '#ef4444',
    'HIGH': '#f97316',
    'MEDIUM': '#eab308',
    'LOW': '#22c55e',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass bg-slate-900/90 p-4 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label || payload[0].name}</p>
                <p className="text-lg font-black text-slate-100">{payload[0].value}</p>
            </div>
        );
    }
    return null;
};

const Charts: React.FC<ChartCardProps> = ({ title, data, type, isLoading }) => {
    if (isLoading) {
        return <div className="glass h-[400px] p-8 rounded-3xl border border-white/5 animate-pulse bg-white/5" />;
    }

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={data}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                            <XAxis
                                dataKey="name"
                                stroke="#64748b"
                                fontSize={10}
                                fontWeight="bold"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={10}
                                fontWeight="bold"
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'pie':
            case 'donut':
                return (
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={type === 'donut' ? 60 : 0}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent h-[400px]">
            <h3 className="text-xl font-bold text-slate-100 mb-6">{title}</h3>
            {renderChart()}
        </div>
    );
};

export default Charts;
