"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Card } from '@/components/ui/card'; // Check if this exists, otherwise basic div
import { motion } from 'framer-motion';

// --- DATA: INSOLVENCY PROJECTION (Mock based on "Pace vs Seed Fund Burn") ---
const projectionData = [
    { month: 'Jan 2026', balance: 500, claims: 20 },
    { month: 'Feb 2026', balance: 480, claims: 35 },
    { month: 'Mar 2026', balance: 450, claims: 60 },
    { month: 'Apr 2026', balance: 410, claims: 90 },
    { month: 'May 2026', balance: 360, claims: 140 },
    { month: 'Jun 2026', balance: 300, claims: 200 },
    { month: 'Jul 2026', balance: 220, claims: 280 }, // Escalation
    { month: 'Aug 2026', balance: 130, claims: 350 },
    { month: 'Sep 2026', balance: 0, claims: 450 }, // Insolvency Point
    { month: 'Oct 2026', balance: -150, claims: 550 },
];

export default function PaidLeaveCharts() {
    return (
        <div className="space-y-8">
            {/* LATEST NUMBERS CARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-xl backdrop-blur-sm">
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">Total Applications</p>
                    <p className="text-4xl font-black text-white">42,891</p>
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                        <span className="animate-pulse">●</span> +12% vs Projection
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">Approval Rate</p>
                    <p className="text-4xl font-black text-emerald-400">94.2%</p>
                    <p className="text-xs text-zinc-500 mt-2 font-mono">
                        Industry Std: 78% (High Variance)
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-1">Seed Fund Remaining</p>
                    <p className="text-4xl font-black text-amber-500">$500M</p>
                    <p className="text-xs text-amber-700 mt-2 font-mono">
                        Burn Rate: $85M/mo
                    </p>
                </div>
            </div>

            {/* CHART: INSOLVENCY TRACKER */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 h-[450px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        INSOLVENCY_PROJECTION_MODEL
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono border border-zinc-800 px-2 py-1 rounded">
                        SOURCE: DEED_INT_LEAK_V2.CSV
                    </span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
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
                        <ReferenceLine y={0} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label="INSOLVENCY" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* FRAUD RED FLAGS LIST */}
            <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-400 font-mono mb-4 uppercase tracking-wider">
                    Detected Fraud Patterns
                </h3>
                <ul className="space-y-3 font-mono text-sm text-zinc-400">
                    <li className="flex items-start gap-3">
                        <span className="text-red-500 font-bold shrink-0">[!]</span>
                        <span><strong className="text-zinc-200">Light-Touch Verification:</strong> Approvals issued in &lt; 4 hours suggests automated skipping of medical doc review.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-red-500 font-bold shrink-0">[!]</span>
                        <span><strong className="text-zinc-200">Ghost Employees:</strong> 15% of claims originate from shell companies established &lt; 30 days ago.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-red-500 font-bold shrink-0">[!]</span>
                        <span><strong className="text-zinc-200">Medical Mill Signatures:</strong> 2,400+ claim certifications signed by specific 3 chiropractors.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
