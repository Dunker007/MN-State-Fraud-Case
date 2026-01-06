"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { PaidLeaveSnapshot } from '@/lib/paid-leave-types';

export default function VelocityRadar({ snapshots }: { snapshots: PaidLeaveSnapshot[] }) {
    if (!snapshots || snapshots.length === 0) return <div>NO_SIGNAL</div>;

    // Transform Data
    const data = [...snapshots].reverse().map(s => ({
        date: s.date.slice(5), // mm-dd
        balance: s.fund_balance_millions,
        claims: s.claims_received,
        velocity: s.claims_received / 100 // Scale for visual
    }));

    return (
        <div className="h-full w-full bg-black border border-green-900/30 p-4 relative">
            <div className="absolute top-2 left-4 z-10">
                <span className="text-xs text-green-500 font-mono bg-green-950/50 px-2 py-0.5 border border-green-900">
                    SYSTEM_MONITOR: FUND_LIQUIDITY
                </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#166534"
                        tick={{ fill: '#166534', fontSize: 10, fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#166534"
                        tick={{ fill: '#166534', fontSize: 10, fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000', borderColor: '#22c55e', color: '#22c55e', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#22c55e' }}
                    />

                    {/* The Balance Line */}
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#22c55e"
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        strokeWidth={2}
                    />

                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                </AreaChart>
            </ResponsiveContainer>

            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none" />
        </div>
    );
}
