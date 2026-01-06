"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, ReferenceLine } from 'recharts';

interface ProjectionChartProps {
    data: Array<{
        date: string;
        balance: number;
        payouts: number;
    }>;
}

export default function ProjectionChart({ data }: ProjectionChartProps) {
    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-6 h-[400px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-purple-500">FUND_TRAJECTORY</span>_ANALYSIS
                </h3>
                <div className="flex items-center gap-4 text-[10px] font-mono">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-purple-500"></span>
                        <span className="text-zinc-500">Balance</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-red-500"></span>
                        <span className="text-zinc-500">Payouts</span>
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff003c" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ff003c" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#444"
                        tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#444"
                        tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v}M`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#000',
                            borderColor: '#333',
                            fontFamily: 'monospace',
                            fontSize: 12
                        }}
                        labelStyle={{ color: '#fff' }}
                    />

                    {/* Reference line at 0 (insolvency) */}
                    <ReferenceLine y={0} stroke="#ff003c" strokeDasharray="5 5" label={{ value: 'INSOLVENCY', fill: '#ff003c', fontSize: 10 }} />

                    {/* Fund Balance */}
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fill="url(#balanceGradient)"
                        name="Fund Balance ($M)"
                    />

                    {/* Cumulative Payouts */}
                    <Line
                        type="monotone"
                        dataKey="payouts"
                        stroke="#ff003c"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Cumulative Payouts ($M)"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
