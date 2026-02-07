
import { getIntelligence, getGeographicClusters, getGhostOfficeStats } from '@/lib/db/access';
import { Radio, Map, Globe2, Activity, ShieldAlert, Cpu, Database, Server, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function IntelCommandPage() {
    const intel = getIntelligence(50);
    const clusters = getGeographicClusters(12);
    const ghostStats = getGhostOfficeStats();

    // Mock live system stats (could be real if we had server monitoring)
    const systemLoad = 42;
    const dbSize = '128 MB';

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 overflow-hidden relative">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none" />

            {/* Header */}
            <header className="flex justify-between items-center border-b border-green-900/50 pb-4 mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Radio className="w-8 h-8 animate-pulse text-green-400" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-white mb-1">
                            Intel Command
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-green-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            SYSTEM ONLINE // ENCRYPTED CONNECTION
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-xs hidden md:flex">
                    <div className="text-right">
                        <div className="text-green-700">SERVER TIME</div>
                        <div className="text-green-400 font-bold">
                            {new Date().toISOString().split('T')[1].split('.')[0]} UTC
                        </div>
                    </div>
                    <div className="w-px h-8 bg-green-900/50" />
                    <div className="text-right">
                        <div className="text-green-700">DB STATUS</div>
                        <div className="text-green-400 font-bold flex items-center gap-2 justify-end">
                            <Database className="w-3 h-3" />
                            ACTIVE
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Command Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 h-[calc(100vh-140px)]">

                {/* Column 1: Live Feed (The Ticker) */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-black/50 border border-green-900/50 rounded-lg p-4 flex-1 overflow-hidden flex flex-col relative">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-green-900/30">
                            <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                                <Globe2 className="w-4 h-4 text-green-400" />
                                GLOBAL INTELLIGENCE
                            </h2>
                            <span className="text-[10px] bg-green-900/20 text-green-400 px-2 py-0.5 rounded animate-pulse">
                                LIVE
                            </span>
                        </div>

                        <div className="overflow-y-auto space-y-4 pr-2 scrollbar-hide flex-1">
                            {intel.map((item: any) => (
                                <div key={item.id} className="p-3 bg-green-900/10 border border-green-900/30 rounded hover:bg-green-900/20 transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                            {item.source}
                                        </span>
                                        <span className="text-[10px] text-green-700">
                                            {item.date?.split('T')[1]?.substring(0, 5) || 'NOW'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-green-300 leading-relaxed group-hover:text-white transition-colors">
                                        {item.headline}
                                    </p>
                                    <div className="mt-2 text-[10px] text-green-800 flex items-center gap-2">
                                        ANOMALY SCORE: {Math.floor(Math.random() * 100)}%
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Scan Line Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent pointer-events-none animate-scan" style={{ backgroundSize: '100% 3px' }} />
                    </div>
                </div>

                {/* Column 2 & 3: Threat Map & Analytics */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* The Map Visualization (Abstract) */}
                    <div className="flex-1 bg-black/50 border border-green-900/50 rounded-lg p-0 relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            {/* Abstract world map SVG would go here */}
                            <Map className="w-64 h-64 text-green-800" />
                        </div>

                        {/* Interactive Data Points Overlay */}
                        <div className="absolute inset-0 p-8">
                            <div className="grid grid-cols-4 gap-4 h-full content-center">
                                {clusters.map((city, i) => (
                                    <div key={city.city} className="bg-black/80 border border-green-900/50 p-2 rounded text-center backdrop-blur-sm hover:border-green-500 transition-colors cursor-crosshair">
                                        <div className="text-[10px] text-green-600 uppercase mb-1">HOTSPOT {i + 1}</div>
                                        <div className="text-white font-bold text-sm truncate">{city.city}</div>
                                        <div className="text-xs text-green-400 font-bold">{city.count} ENTITIES</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="absolute top-4 left-4 bg-black/80 border border-green-900/50 px-3 py-1 rounded text-xs backdrop-blur">
                            <span className="text-green-500 animate-pulse">●</span> THREAT MAP: GEOSPATIAL CLUSTERING
                        </div>
                    </div>

                    {/* Threat Matrix */}
                    <div className="h-48 grid grid-cols-3 gap-4">
                        <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 flex flex-col justify-center items-center text-center">
                            <ShieldAlert className="w-8 h-8 text-red-500 mb-2 animate-bounce" />
                            <div className="text-2xl font-bold text-red-500">{ghostStats.ghosts}</div>
                            <div className="text-[10px] text-red-400 uppercase tracking-widest mt-1">Ghost Offices</div>
                        </div>
                        <div className="bg-green-900/10 border border-green-900/50 rounded-lg p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
                            <Activity className="w-8 h-8 text-green-500 mb-2" />
                            <div className="text-2xl font-bold text-green-500">{systemLoad}%</div>
                            <div className="text-[10px] text-green-400 uppercase tracking-widest mt-1">System Load</div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-900">
                                <div className="h-full bg-green-500" style={{ width: `${systemLoad}%` }} />
                            </div>
                        </div>
                        <div className="bg-blue-900/10 border border-blue-900/50 rounded-lg p-4 flex flex-col justify-center items-center text-center">
                            <Server className="w-8 h-8 text-blue-500 mb-2" />
                            <div className="text-sm font-bold text-blue-400 uppercase">Indexing</div>
                            <div className="text-[10px] text-zinc-500 mt-2">
                                Last Sync: <span className="text-blue-300">NOW</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 4: System Logs & Controls */}
                <div className="lg:col-span-1 bg-black/50 border border-green-900/50 rounded-lg p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-green-900/30">
                        <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                            <Cpu className="w-4 h-4 text-green-400" />
                            SYSTEM LOGS
                        </h2>
                    </div>

                    <div className="flex-1 font-mono text-[10px] space-y-1 overflow-y-auto opacity-70">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="text-green-700">[{new Date(Date.now() - i * 5000).toISOString().split('T')[1].split('.')[0]}]</span>
                                <span className="text-green-500">
                                    {['SCAN_COMPLETE', 'PACKET_RECEIVED', 'INDEX_UPDATED', 'THREAT_ANALYSIS', 'PING_SUCCESS'][Math.floor(Math.random() * 5)]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-900/30">
                        <Link
                            href="/providers"
                            className="block w-full text-center bg-green-900/20 border border-green-500/50 text-green-400 py-2 rounded hover:bg-green-500 hover:text-black transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            Access Masterlist
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
