"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { PaidLeaveDatabase } from '@/lib/paid-leave-types';

export interface PaidLeaveLiveChartsProps {
    initialData?: PaidLeaveDatabase;
}

export default function PaidLeaveLiveCharts({ initialData }: PaidLeaveLiveChartsProps) {
    const [db, setDb] = useState<PaidLeaveDatabase | null>(initialData || null);

    useEffect(() => {
        if (!initialData) {
            fetch('/api/paid-leave')
                .then(res => res.json())
                .then(data => setDb(data))
                .catch(err => console.error("Failed to fetch live chart data", err));
        }
    }, [initialData]);

    if (!db || !db.snapshots || db.snapshots.length === 0) {
        return <div className="text-zinc-500 text-sm p-4 text-center">Loading Live Data...</div>;
    }

    // Transform snapshots for Recharts
    // Sort oldest to newest for the graph
    const chartData = [...db.snapshots].reverse().map(s => ({
        date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: s.fund_balance_millions,
        claims: s.claims_received / 1000, // Convert to k
        approved: s.claims_approved / 1000,
        fullDate: s.date
    }));

    // Latest snapshot for the cards
    const latest = db.snapshots[0]; // Newest is first in our API sort

    return (
        <div className="space-y-8">
            {/* LATEST NUMBERS CARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-xl backdrop-blur-sm">
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">Total Applications</p>
                    <p className="text-4xl font-black text-white">{latest.claims_received.toLocaleString()}</p>
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                        <span className="animate-pulse">●</span> Record Velocity
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">Approval Rate</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-emerald-400">
                            {latest.claims_received > 0 ? Math.round((latest.claims_approved / latest.claims_received) * 100) : 0}%
                        </p>
                        <span className="text-xs text-zinc-500 font-mono">(Processed)</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 font-mono">
                        {latest.claims_approved.toLocaleString()} Approved / {latest.claims_received.toLocaleString()} Total
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">Seed Fund Remaining</p>
                    <p className="text-4xl font-black text-amber-500">${latest.fund_balance_millions}M</p>
                    <p className="text-xs text-amber-700 mt-2 font-mono">
                        Data from: {latest.date}
                    </p>
                </div>
            </div>

            {/* Data Source Footer */}
            <div className="flex justify-end -mt-4 mb-4">
                <p className="text-[10px] text-zinc-600 font-mono text-right italic">
                    Source: {latest.notes || 'DEED Live Feed'} // {latest.source_url ? 'Verified' : 'Unverified'}
                </p>
            </div>

            {/* CHART: INSOLVENCY TRACKER */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 h-[450px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        INSOLVENCY_PROJECTION_MODEL (LIVE)
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono border border-zinc-800 px-2 py-1 rounded">
                        SOURCE: INTERNAL_DB
                    </span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" stroke="#F59E0B" tick={{ fontSize: 12 }} label={{ value: 'Fund Balance ($M)', angle: -90, position: 'insideLeft', fill: '#F59E0B' }} domain={[0, 'auto']} />
                        <YAxis yAxisId="right" orientation="right" stroke="#EF4444" tick={{ fontSize: 12 }} label={{ value: 'Claims (000s)', angle: 90, position: 'insideRight', fill: '#EF4444' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {/* Fund Balance Line */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="balance"
                            name="Seed Fund Balance ($M)"
                            stroke="#F59E0B" // Amber
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 8 }}
                        />

                        {/* Claims Volume Line */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="claims"
                            name="Claims Volume (k)"
                            stroke="#EF4444" // Red
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />

                        {/* Insolvency Limit Line */}
                        <ReferenceLine y={0} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label="INSOLVENCY LINE" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
