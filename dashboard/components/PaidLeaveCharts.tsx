"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { useState, useEffect, useRef } from 'react';
import { PaidLeaveSnapshot } from '@/lib/paid-leave-types';
import { ProjectionResult } from '@/lib/actuary';

// Fallback static data for when no live data is available
const FALLBACK_PROJECTION = [
    { month: 'Jan 2026', balance: 500, claims: 11.9 },
    { month: 'Feb 2026', balance: 410, claims: 22.5 },
    { month: 'Mar 2026', balance: 300, claims: 38.0 },
    { month: 'Apr 2026', balance: 180, claims: 55.2 },
    { month: 'May 2026', balance: 50, claims: 75.0 },
    { month: 'Jun 2026', balance: -120, claims: 98.4 },
    { month: 'Jul 2026', balance: -310, claims: 125.0 },
    { month: 'Aug 2026', balance: -550, claims: 150.0 },
];

interface PaidLeaveChartsProps {
    snapshots?: PaidLeaveSnapshot[];
    projection?: ProjectionResult;
    lastUpdated?: string;
}

export default function PaidLeaveCharts({ snapshots, projection, lastUpdated }: PaidLeaveChartsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { offsetWidth, offsetHeight } = containerRef.current;
                if (offsetWidth > 0 && offsetHeight > 0) {
                    setDimensions({ width: offsetWidth, height: offsetHeight });
                }
            }
        };

        const timer = setTimeout(updateDimensions, 50);
        window.addEventListener('resize', updateDimensions);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    // Transform snapshots into chart data OR use extended projection
    const chartData = snapshots && snapshots.length > 0
        ? generateChartData(snapshots, projection)
        : FALLBACK_PROJECTION;

    // Calculate live metrics from snapshots
    const latestSnapshot = snapshots?.[0];
    const applicationsToday = latestSnapshot?.claims_received || 0;
    const approvalRate = latestSnapshot && latestSnapshot.claims_received > 0
        ? Math.round((latestSnapshot.claims_approved / latestSnapshot.claims_received) * 100)
        : 0;
    const burnRate = projection?.currentBurnRateDaily || 8.0;
    const daysToInsolvency = projection?.daysUntilInsolvency || 58;

    const chartReady = dimensions.width > 0 && dimensions.height > 0;

    // Data source label
    const dataSourceLabel = lastUpdated
        ? `Live Data // Updated ${new Date(lastUpdated).toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} CST`
        : 'Fallback projection data';

    return (
        <div className="space-y-4 h-[600px] flex flex-col">
            {/* Data Source Footer */}
            <div className="flex justify-between items-center -mt-4 mb-4">
                <div className="flex items-center gap-2">
                    {snapshots && snapshots.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[10px] font-mono text-green-400">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            LIVE
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-zinc-600 font-mono text-right italic">
                    {dataSourceLabel}
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

                <div ref={containerRef} className="w-full h-96 lg:h-[500px]">
                    {chartReady ? (
                        <LineChart
                            data={chartData}
                            width={dimensions.width}
                            height={dimensions.height}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
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
                                stroke="#F59E0B"
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
                                stroke="#EF4444"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />

                            {/* Insolvency Limit Line */}
                            <ReferenceLine y={0} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label="INSOLVENCY LINE" />
                        </LineChart>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs animate-pulse">
                            CALCULATING_PROJECTION_MODEL...
                        </div>
                    )}
                </div>
            </div>

            {/* LIVE METRICS STRIP */}
            <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-3 flex items-center justify-between gap-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Applications</p>
                        <p className="text-lg font-black text-white leading-none">{applicationsToday.toLocaleString()}</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Latest snapshot</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Approval Rate</p>
                        <p className="text-lg font-black text-white leading-none">{approvalRate}%</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Approved/Received</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Avg Processing</p>
                        <p className="text-lg font-black text-white leading-none">24h</p>
                        <p className="text-[9px] text-emerald-500 font-mono mt-0.5">▼ Target: 48h</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Burn Rate</p>
                        <p className="text-lg font-black text-white leading-none">${burnRate.toFixed(1)}M</p>
                        <p className="text-[9px] text-red-500 font-mono mt-0.5">▲ /day</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-0.5">Time Left</p>
                        <p className="text-lg font-black text-red-500 leading-none">{daysToInsolvency} Days</p>
                        <p className="text-[9px] text-red-400/60 font-mono mt-0.5">Projected</p>
                    </div>
                </div>

                {/* Gauge Pointer */}
                <div className="hidden lg:flex items-center gap-2 text-purple-500 shrink-0 opacity-80 mb-1 border-l border-red-900/30 pl-4">
                    <div className="text-right font-mono">
                        <p className="text-[10px] font-bold uppercase leading-tight text-zinc-400 block mb-0.5">Live Meter</p>
                        <p className="text-[10px] font-bold uppercase leading-tight text-purple-400">0% = Insolvency</p>
                        <p className="text-[10px] font-bold uppercase leading-tight text-red-500">
                            (Est. {projection?.projectedInsolvencyDate
                                ? new Date(projection.projectedInsolvencyDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                                : "June '26"})
                        </p>
                    </div>
                    <svg width="50" height="30" viewBox="0 0 50 30" className="overflow-visible">
                        <path d="M0 25 Q 25 25 45 5" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead-charts)" />
                        <defs>
                            <marker id="arrowhead-charts" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <path d="M0 0 L 6 3 L 0 6 Z" fill="currentColor" />
                            </marker>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
}

// Generate chart data from snapshots with future projection
function generateChartData(snapshots: PaidLeaveSnapshot[], projection?: ProjectionResult) {
    // Sort ascending by date
    const sorted = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Map actual data points
    const actualData = sorted.map(s => ({
        month: formatMonth(s.date),
        balance: s.fund_balance_millions,
        claims: s.claims_received / 1000, // Convert to thousands
        isProjected: false
    }));

    // If we have projection data, extend the chart into the future
    if (projection && actualData.length > 0) {
        const lastBalance = actualData[actualData.length - 1].balance;
        const lastClaims = actualData[actualData.length - 1].claims || 0;
        const burnRate = projection.currentBurnRateDaily;

        // Project 6 months ahead
        const today = new Date();
        for (let i = 1; i <= 6; i++) {
            const futureDate = new Date(today);
            futureDate.setMonth(futureDate.getMonth() + i);

            const daysAhead = i * 30;
            const projectedBalance = lastBalance - (burnRate * daysAhead);
            const projectedClaims = lastClaims * (1 + (i * 0.15)); // 15% growth per month

            actualData.push({
                month: formatMonth(futureDate.toISOString()),
                balance: Math.round(projectedBalance * 10) / 10,
                claims: Math.round(projectedClaims * 10) / 10,
                isProjected: true
            });

            // Stop if insolvency reached
            if (projectedBalance <= 0) break;
        }
    }

    return actualData;
}

function formatMonth(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
