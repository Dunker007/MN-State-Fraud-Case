import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio, Hash, Globe, TrendingUp, BarChart3 } from 'lucide-react';

const TRENDING_TOPICS = [
    { tag: '#DHSFraud', volume: '24.5k', sentiment: 'critical', growth: '+120%' },
    { tag: 'Governor Walz', volume: '18.2k', sentiment: 'neutral', growth: '+45%' },
    { tag: 'Feeding Our Future', volume: '12.1k', sentiment: 'warning', growth: '+15%' },
    { tag: 'ResignationWatch', volume: '8.4k', sentiment: 'critical', growth: '+200%' },
    { tag: 'MNLeg', volume: '5.2k', sentiment: 'neutral', growth: '+10%' },
];

const PLATFORM_DISTRIBUTION = [
    { name: 'Twitter/X', percent: 45, color: 'bg-zinc-100' },
    { name: 'Traditional News', percent: 30, color: 'bg-cyan-500' },
    { name: 'Facebook', percent: 15, color: 'bg-blue-600' },
    { name: 'Reddit', percent: 10, color: 'bg-orange-500' },
];

const MediaPulse = () => {
    return (
        <div className="bg-[#09090b] border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full min-h-[300px]">
            {/* Header */}
            <div className="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Media Pulse // Real-time Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-500">LIVE FEED</span>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {/* Left Col: Narrative Velocity & Publishers */}
                <div className="flex flex-col gap-6">
                    {/* Coverage Graph */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                                <BarChart3 className="w-3 h-3" />
                                COVERAGE INTENSITY (24H)
                            </h3>
                            <span className="text-[10px] font-mono text-cyan-400">+34% vs Yesterday</span>
                        </div>

                        {/* Mock Histogram */}
                        <div className="flex items-end justify-between h-32 gap-1 border-b border-zinc-800 pb-1">
                            {[40, 65, 30, 80, 55, 90, 45, 60, 35, 20, 50, 75, 60, 85, 95, 70, 50, 40, 60, 80, 90, 65, 45, 30].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                    className={`w-full rounded-t ${h > 80 ? 'bg-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-zinc-800/50'}`}
                                />
                            ))}
                        </div>

                        {/* Platform Split */}
                        <div className="space-y-2 mt-2">
                            <h4 className="text-[10px] font-mono text-zinc-500 uppercase">Platform Distribution</h4>
                            <div className="h-2 w-full flex rounded-full overflow-hidden">
                                {PLATFORM_DISTRIBUTION.map((p, i) => (
                                    <div key={i} style={{ width: `${p.percent}%` }} className={`${p.color} h-full`} />
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-400">
                                {PLATFORM_DISTRIBUTION.map((p, i) => (
                                    <span key={i}>{p.name} {p.percent}%</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Publishers - Filling the space below chart */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/50">
                        <h4 className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            Active Outlets (Reach/Bias)
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { name: 'Star Tribune', reach: 'High', bias: 'Center-Left', color: 'bg-blue-900/20 text-blue-400' },
                                { name: 'KSTP 5 Eyewitness', reach: 'Med-High', bias: 'Center', color: 'bg-purple-900/20 text-purple-400' },
                                { name: 'Alpha News', reach: 'Medium', bias: 'Right', color: 'bg-red-900/20 text-red-400' },
                            ].map((outlet, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-zinc-900/30 p-2 rounded border border-zinc-800/30">
                                    <span className="text-zinc-300 font-medium">{outlet.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-500">{outlet.reach}</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${outlet.color}`}>
                                            {outlet.bias}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: Trending Hashtags/Topics */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                        <Hash className="w-3 h-3" />
                        VIRAL VECTORS
                    </h3>

                    <div className="space-y-3">
                        {TRENDING_TOPICS.map((topic, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded hover:border-zinc-700 transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                                        {topic.tag}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                        Vol: {topic.volume}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${topic.sentiment === 'critical' ? 'bg-red-900/30 text-red-400' :
                                            topic.sentiment === 'warning' ? 'bg-amber-900/30 text-amber-400' :
                                                'bg-zinc-800 text-zinc-400'
                                        }`}>
                                        {topic.sentiment}
                                    </span>
                                    <span className="text-[10px] text-green-500 font-mono flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {topic.growth}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaPulse;
