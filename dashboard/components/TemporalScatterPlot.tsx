"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell
} from 'recharts';
import { AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { parseStatusWithDate, type Entity } from '@/lib/schemas';

interface TemporalScatterPlotProps {
    entities: Entity[];
}

interface DataPoint {
    x: number; // timestamp
    y: number; // risk score
    name: string;
    id: string;
    status: string;
    statusType: 'revoked' | 'active' | 'conditional' | 'unknown';
    date: Date;
}

const STATUS_COLORS = {
    revoked: '#ff003c',    // neon-red
    conditional: '#f59e0b', // amber
    active: '#22c55e',      // green
    unknown: '#71717a',     // zinc
};

// Custom tooltip for data points

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Record<string, unknown>[] }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as DataPoint;
    const formattedDate = data.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="bg-black/95 border border-zinc-700 p-3 shadow-xl font-mono text-xs">
            <div className="text-white font-bold mb-1">{data.name}</div>
            <div className="text-zinc-400">{data.id}</div>
            <div className="mt-2 flex flex-col gap-1">
                <span className="text-zinc-500">Date: <span className="text-white">{formattedDate}</span></span>
                <span className="text-zinc-500">Risk: <span className={`font-bold ${data.y > 100 ? 'text-neon-red' : 'text-amber-500'}`}>{data.y}</span></span>
                <span className={`mt-1 px-1 py-0.5 text-[10px] uppercase ${data.statusType === 'revoked' ? 'bg-red-950 text-red-400' :
                    data.statusType === 'conditional' ? 'bg-amber-950 text-amber-400' :
                        'bg-green-950 text-green-400'
                    }`}>
                    {data.status}
                </span>
            </div>
        </div>
    );
};

export default function TemporalScatterPlot({ entities }: TemporalScatterPlotProps) {
    // Parse entities into temporal data points
    const dataPoints = useMemo<DataPoint[]>(() => {
        return entities
            .map(entity => {
                const parsed = parseStatusWithDate(entity);
                if (!parsed.parsedDate) return null;

                let statusType: DataPoint['statusType'] = 'unknown';
                if (parsed.isRevoked) statusType = 'revoked';
                else if (parsed.isConditional) statusType = 'conditional';
                else if (parsed.isActive) statusType = 'active';

                return {
                    x: parsed.parsedDate.getTime(),
                    y: entity.risk_score,
                    name: entity.name,
                    id: entity.id,
                    status: entity.status,
                    statusType,
                    date: parsed.parsedDate,
                };
            })
            .filter((p): p is DataPoint => p !== null)
            .sort((a, b) => a.x - b.x);
    }, [entities]);

    // Calculate October 2024 reference line (the key date)
    const oct9_2024 = new Date(2024, 9, 9).getTime(); // Oct 9, 2024

    // Summary stats
    const stats = useMemo(() => {
        const octoberPoints = dataPoints.filter(p => {
            const d = p.date;
            return d.getMonth() === 9 && d.getFullYear() === 2024; // October 2024
        });
        const revokedInOctober = octoberPoints.filter(p => p.statusType === 'revoked').length;

        return {
            totalPoints: dataPoints.length,
            octoberCount: octoberPoints.length,
            revokedInOctober,
            avgRiskOctober: octoberPoints.length > 0
                ? Math.round(octoberPoints.reduce((s, p) => s + p.y, 0) / octoberPoints.length)
                : 0,
        };
    }, [dataPoints]);

    if (dataPoints.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-zinc-400 font-mono text-sm">NO TEMPORAL DATA AVAILABLE</p>
                <p className="text-zinc-600 text-xs mt-1">Entity statuses do not contain parseable dates</p>
            </div>
        );
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                <TrendingUp className="w-5 h-5 text-neon-red" />
                <div>
                    <h2 className="text-xl font-bold text-white font-mono tracking-tight">
                        TEMPORAL_ANOMALY_DETECTION
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        License Actions Over Time | Red Line = Oct 9, 2024 (DHS Suspension)
                    </p>
                </div>
            </div>

            {/* Stats Bar - More Compact */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-2.5 rounded">
                    <div className="text-zinc-500 text-[9px] font-mono uppercase">Total Data Points</div>
                    <div className="text-xl font-bold text-white font-mono">{stats.totalPoints}</div>
                </div>
                <div className="bg-red-950/20 border border-red-900 p-2.5 rounded">
                    <div className="text-zinc-500 text-[9px] font-mono uppercase">October 2024 Cluster</div>
                    <div className="text-xl font-bold text-neon-red font-mono animate-pulse">{stats.octoberCount}</div>
                </div>
                <div className="bg-red-950/20 border border-red-900 p-2.5 rounded">
                    <div className="text-zinc-500 text-[9px] font-mono uppercase">Revoked (Oct &apos;24)</div>
                    <div className="text-xl font-bold text-red-500 font-mono">{stats.revokedInOctober}</div>
                </div>
                <div className="bg-amber-950/20 border border-amber-900 p-2.5 rounded">
                    <div className="text-zinc-500 text-[9px] font-mono uppercase">Avg Risk (Oct &apos;24)</div>
                    <div className="text-xl font-bold text-amber-500 font-mono">{stats.avgRiskOctober}</div>
                </div>
            </div>

            {/* Chart - Reduced Height */}
            <div className="bg-black border border-zinc-800 p-4 relative rounded-lg shadow-lg">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/5 via-transparent to-amber-950/5 pointer-events-none rounded-lg"></div>

                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                        <XAxis
                            type="number"
                            dataKey="x"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                            stroke="#71717a"
                            fontSize={10}
                            fontFamily="monospace"
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Risk Score"
                            stroke="#71717a"
                            fontSize={10}
                            fontFamily="monospace"
                            label={{ value: 'RISK SCORE', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 10 }}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* October 9, 2024 Reference Line */}
                        <ReferenceLine
                            x={oct9_2024}
                            stroke="#ff003c"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                                value: 'OCT 9 SUSPENSION',
                                position: 'top',
                                fill: '#ff003c',
                                fontSize: 10,
                                fontFamily: 'monospace',
                                fontWeight: 'bold'
                            }}
                        />

                        <Scatter name="Entities" data={dataPoints}>
                            {dataPoints.map((point, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={STATUS_COLORS[point.statusType]}
                                    fillOpacity={0.8}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Legend - Inline with chart */}
                <div className="flex justify-center gap-6 mt-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS.revoked }}></div>
                        REVOKED
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS.conditional }}></div>
                        CONDITIONAL
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS.active }}></div>
                        ACTIVE
                    </span>
                </div>
            </div>

            {/* Analysis Callout - Compact */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 bg-red-950/20 border border-red-900/50 p-3 flex items-start gap-2 rounded"
            >
                <Target className="w-4 h-4 text-neon-red flex-shrink-0 mt-0.5" />
                <div className="text-[10px] font-mono leading-relaxed">
                    <span className="text-neon-red font-bold">FORENSIC OBSERVATION:</span>
                    <span className="text-zinc-400 ml-1">
                        {stats.octoberCount > 0
                            ? `Significant clustering of ${stats.octoberCount} license actions detected around October 2024. 
                               ${stats.revokedInOctober} entities show REVOKED status during this period, 
                               coinciding with DHS payment suspensions announced October 9th.`
                            : 'No significant temporal clustering detected around the October 2024 suspension date.'}
                    </span>
                </div>
            </motion.div>
        </motion.section>
    );
}
