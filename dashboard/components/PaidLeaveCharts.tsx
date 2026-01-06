"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useState, useEffect } from 'react';

// --- DATA: INSOLVENCY PROJECTION (Updated Jan 2, 2026 - DEED Real Numbers) ---
// REALITY CHECK: 11,883 apps in first 48 hours.
// Burn Rate Estimate: ~12k apps * ~$3k avg payout (conservative partial) = ~$36M committed per week?
// Logic: If pace holds, $500M seed is gone in MONTHS, not years.
const projectionData = [
    { month: 'Jan 2026', balance: 500, claims: 11.9 }, // 11,883 actual
    { month: 'Feb 2026', balance: 410, claims: 22.5 }, // Projection based on current velocity
    { month: 'Mar 2026', balance: 300, claims: 38.0 },
    { month: 'Apr 2026', balance: 180, claims: 55.2 },
    { month: 'May 2026', balance: 50, claims: 75.0 }, // CRITICAL LOW
    { month: 'Jun 2026', balance: -120, claims: 98.4 }, // INSOLVENCY
    { month: 'Jul 2026', balance: -310, claims: 125.0 },
    { month: 'Aug 2026', balance: -550, claims: 150.0 },
];

export default function PaidLeaveCharts() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-4 h-[600px] flex flex-col">
            {/* Data Source Footer */}
            <div className="flex justify-end -mt-4 mb-4">
                <p className="text-[10px] text-zinc-600 font-mono text-right italic">
                    Data source: DEED press release Jan 2, 2026 // 08:30 CST
                </p>
            </div>

            {/* CHART: INSOLVENCY TRACKER */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex-1 relative overflow-hidden flex flex-col">
                <div className="absolute top-4 left-4 z-10">
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        INSOLVENCY_PROJECTION_MODEL
                    </h3>
                </div>

                <div className="w-full h-96 lg:h-[500px]">
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%" aspect={2}>
                            <LineChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" stroke="#F59E0B" tick={{ fontSize: 12 }} label={{ value: 'Fund Balance ($M)', angle: -90, position: 'insideLeft', fill: '#F59E0B' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#EF4444" tick={{ fontSize: 12 }} label={{ value: 'Claims (000s)', angle: 90, position: 'insideRight', fill: '#EF4444' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
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
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs animate-pulse">
                            CALCULATING_PROJECTION_MODEL...
                        </div>
                    )}
                </div>
            </div>

            {/* FRAUD RED FLAGS LIST - Hidden for now to save space or made compact */}
            {/* FRAUD RED FLAGS LIST & GAUGE POINTER */}
            <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-3 flex items-center justify-between gap-4">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                    {/* Applications Today */}
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Applications Today</p>
                        <p className="text-lg font-black text-white leading-none">0</p>
                        <p className="text-[9px] text-emerald-500 font-mono mt-0.5">▲ +12% vs avg</p>
                    </div>
                    {/* Approval Rate */}
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Approval Rate</p>
                        <p className="text-lg font-black text-white leading-none">0%</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Last 24h</p>
                    </div>
                    {/* Avg Processing */}
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Avg Processing</p>
                        <p className="text-lg font-black text-white leading-none">24h</p>
                        <p className="text-[9px] text-emerald-500 font-mono mt-0.5">▼ Target: 48h</p>
                    </div>
                    {/* Burn Rate */}
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Burn Rate</p>
                        <p className="text-lg font-black text-white leading-none">$8.0M</p>
                        <p className="text-[9px] text-red-500 font-mono mt-0.5">▲ /day</p>
                    </div>
                    {/* Days to Insolvency */}
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Time Left</p>
                        <p className="text-lg font-black text-red-500 leading-none">58 Days</p>
                        <p className="text-[9px] text-red-400/60 font-mono mt-0.5">Projected</p>
                    </div>
                </div>

                {/* Gauge Pointer */}
                <div className="hidden lg:flex items-center gap-2 text-purple-500 shrink-0 opacity-80 mb-1 border-l border-red-900/30 pl-4">
                    <div className="text-right font-mono">
                        <p className="text-[10px] font-bold uppercase leading-tight text-zinc-400 block mb-0.5">Live Meter</p>
                        <p className="text-[10px] font-bold uppercase leading-tight text-purple-400">0% = Insolvency</p>
                        <p className="text-[10px] font-bold uppercase leading-tight text-red-500">(Est. June '26)</p>
                    </div>
                    <svg width="50" height="30" viewBox="0 0 50 30" className="overflow-visible">
                        {/* Swooping arrow pointing right and slightly up */}
                        <path d="M0 25 Q 25 25 45 5" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                        <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <path d="M0 0 L 6 3 L 0 6 Z" fill="currentColor" />
                            </marker>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
}
