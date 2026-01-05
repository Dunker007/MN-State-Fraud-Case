'use client';

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { motion } from 'framer-motion';
import {
    LayoutGrid,
    TrendingUp,
    AlertCircle,
    Users,
    Map as MapIcon,
    ShieldAlert,
    Building2,
    Search
} from 'lucide-react';
import { masterlistData, getMasterlistStats } from '@/lib/data';

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

export default function CensusAnalyst() {
    const stats = getMasterlistStats();
    const entities = masterlistData.entities;

    const typeBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        entities.forEach(e => {
            const type = e.service_type || 'Unknown';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, value]) => ({ name, value }));
    }, [entities]);

    const cityBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        entities.forEach(e => {
            if (e.city) counts[e.city] = (counts[e.city] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }));
    }, [entities]);

    const ownerConcentration = useMemo(() => {
        const counts: Record<string, number> = {};
        entities.forEach(e => {
            if (e.owner && e.owner !== 'UNKNOWN' && e.owner !== e.name) {
                counts[e.owner] = (counts[e.owner] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }, [entities]);

    const statusPie = useMemo(() => {
        return Object.entries(stats.statusCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [stats]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <LayoutGrid className="w-6 h-6 text-blue-500" />
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                        Census Intelligence & Anomaly Detection
                    </h2>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                        Macro Analysis of {stats.total.toLocaleString()} Licensed Entities
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stats Cards */}
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase">Provider density</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-white">{stats.total.toLocaleString()}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-tighter">
                            Total Records in 87 Counties
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase">Enforcement actions</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-red-500">
                            {(stats.statusCounts['Revoked'] || 0) + (stats.statusCounts['Denied'] || 0)}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-tighter">
                            Total Revokes & Denials Detected
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase">Ghost office rate</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-amber-500">
                            {((stats.ghostOfficesCount / stats.total) * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-tighter">
                            {stats.ghostOfficesCount.toLocaleString()} Anomalous Addresses
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase">Census freshness</span>
                    </div>
                    <div>
                        <div className="text-lg font-black text-white">JAN 4, 2026</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-tighter">
                            Latest 87-County Sweep
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Type Breakdown */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Top License Categories</h3>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeBreakdown} layout="vertical" margin={{ left: 40, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={150}
                                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {typeBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Share */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Enforcement Ratio</h3>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusPie}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusPie.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : (index === 1 ? '#ef4444' : COLORS[index % COLORS.length])} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full mt-4">
                            {statusPie.map((s, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: i === 0 ? '#10b981' : (i === 1 ? '#ef4444' : COLORS[i % COLORS.length]) }} />
                                        <span className="text-[10px] text-zinc-500 font-mono truncate">{s.name}</span>
                                    </div>
                                    <span className="text-[10px] text-white font-bold font-mono">{s.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Cities */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <MapIcon className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Top Concentration: CITIES</h3>
                    </div>
                    <div className="space-y-3">
                        {cityBreakdown.map((city, i) => {
                            const percentage = (city.value / stats.total) * 100;
                            return (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-xs font-bold text-zinc-300">{city.name}</span>
                                        <span className="text-[10px] font-mono text-zinc-500">{city.value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(city.value / cityBreakdown[0].value) * 100}%` }}
                                            className="h-full bg-cyan-500/60"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Owners */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="w-4 h-4 text-purple-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Super-Owners: Multi-Entity Detection</h3>
                    </div>
                    <div className="overflow-hidden border border-zinc-800 rounded-lg">
                        <table className="w-full text-left text-[10px]">
                            <thead className="bg-black text-zinc-500 uppercase font-black tracking-tighter">
                                <tr>
                                    <th className="p-3">LICENSE_HOLDER</th>
                                    <th className="p-3 text-right">TOTAL_ENTITIES</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 font-mono">
                                {ownerConcentration.map(([owner, count], i) => (
                                    <tr key={i} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="p-3 font-bold text-zinc-300 truncate max-w-[200px]">{owner}</td>
                                        <td className="p-3 text-right font-black text-white">{count}</td>
                                        <td className="p-3 text-right">
                                            <button className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-500 group-hover:text-blue-400">
                                                <Search className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 p-3 bg-red-950/10 border border-red-900/30 rounded-lg">
                        <div className="flex gap-3">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-[9px] text-red-300 font-mono leading-relaxed uppercase">
                                <span className="font-bold underline">ANOMALY_WARNING:</span> High concentration of entities under a single "License Holder" often indicates
                                <span className="text-white font-bold"> centralized fraud networks</span> fronted by individual straw owners.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
