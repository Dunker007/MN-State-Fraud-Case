import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ExternalLink, X, MousePointerClick } from 'lucide-react';

// Mock Data for the Timeline - DEC 2025 (Past 30 Days)
const TIMELINE_DATA = [
    { date: 'Dec 01', sentiment: 65, event: 'System Audit Leaked', type: 'news', link: '#' },
    { date: 'Dec 05', sentiment: 55, event: '', type: '' },
    { date: 'Dec 08', sentiment: 45, event: 'Governor demands answer', type: 'critical', link: '#' },
    { date: 'Dec 12', sentiment: 48, event: '', type: '' },
    { date: 'Dec 15', sentiment: 40, event: 'Director testimony', type: 'warning', link: '#' },
    { date: 'Dec 20', sentiment: 30, event: '', type: '' },
    { date: 'Dec 24', sentiment: 25, event: 'Fraud total hits $200M', type: 'critical', link: '#' },
    { date: 'Dec 28', sentiment: 35, event: 'New safeguards announced', type: 'news', link: '#' },
    { date: 'Dec 30', sentiment: 42, event: '', type: '' },
    { date: 'Dec 31', sentiment: 50, event: 'Reform Bill Signed', type: 'positive', link: '#' },
];

const SentimentPoint = ({ x, y, data, index, onSelect }: { x: number, y: number, data: any, index: number, onSelect: (data: any) => void }) => {
    const isInteractive = !!data.event;

    // Determine status based on height (sentiment score)
    // POS (Top): > 55
    // NEU: 45 - 55
    // WRN: 30 - 44
    // CRT (Bottom): < 30
    const getStatus = (s: number) => {
        if (s > 55) return 'positive';
        if (s >= 45) return 'neutral';
        if (s >= 30) return 'warning';
        return 'critical';
    };

    const status = getStatus(data.sentiment);

    return (
        <div
            className={`absolute group ${isInteractive ? 'cursor-pointer' : ''}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => isInteractive && onSelect(data)}
        >
            {/* The Dot */}
            <div className={`relative w-3 h-3 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
                ${status === 'critical' ? 'bg-red-500 border-red-900 shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20 hover:scale-150' :
                    status === 'positive' ? 'bg-green-500 border-green-900 shadow-[0_0_10px_rgba(34,197,94,0.5)] z-20 hover:scale-150' :
                        status === 'warning' ? 'bg-amber-500 border-amber-900 z-10 hover:scale-125' :
                            'bg-slate-500 border-slate-800 z-10 hover:scale-125'} 
                `}
            >
                {/* Click Indicator Icon (Only for interactive nodes) */}
                {isInteractive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="absolute -top-4 -right-4 bg-zinc-900 border border-zinc-700 rounded-full p-0.5 pointer-events-none"
                    >
                        <MousePointerClick className="w-2 h-2 text-cyan-400" />
                    </motion.div>
                )}
            </div>

            {/* Simple Hover Tooltip (Disabled if clicked/active usually, but keeping for quick scan) */}
            {data.event && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-xl text-center">
                        <div className="text-[10px] text-zinc-500 font-mono mb-1">{data.date}</div>
                        <div className="text-xs font-bold text-zinc-100">{data.event}</div>
                        <div className="text-[9px] text-cyan-400 mt-1 uppercase tracking-wider">Click to view</div>
                    </div>
                </div>
            )}

            {/* Date Label on Axis */}
            {(index % 2 === 0 || data.event) && (
                <div className="absolute top-[80px] left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 font-mono whitespace-nowrap">
                    {data.date}
                </div>
            )}
        </div>
    );
};

const PublicSentimentTracker = () => {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    return (
        <div className="w-full h-[180px] bg-[#09090b] border border-zinc-800 rounded-lg relative overflow-hidden flex flex-col">
            {/* Header / Stats Strip */}
            <div className="h-8 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-zinc-300 tracking-wider">PUBLIC NARRATIVE TIMELINE (DEC 2025)</span>
                    <span className="hidden md:inline-block text-[10px] text-zinc-600 font-mono ml-4 border-l border-zinc-800 pl-4 uppercase">
                        Source: Aggregated Social & MSM (Major Events / 3-Day Interval)
                    </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                    30-DAY TRACKER
                </div>
            </div>

            {/* Main Viz Area */}
            <div className="flex-1 relative mx-12 my-4">
                {/* Y-AXIS LABELS (The "Stacked Legend") */}
                <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-[9px] font-mono font-bold text-zinc-600 py-2 pointer-events-none">
                    <div className="text-green-900/80">POS</div>
                    <div className="text-slate-700">NEU</div>
                    <div className="text-amber-900/80">WRN</div>
                    <div className="text-red-900/80">CRT</div>
                </div>

                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full h-px bg-green-900/10"></div>
                    <div className="w-full h-px bg-zinc-800/30"></div>
                    <div className="w-full h-px bg-amber-900/10"></div>
                    <div className="w-full h-px bg-red-900/20"></div>
                </div>

                {/* Dynamic Data Points Calculation */}
                {(() => {
                    const getCoordinates = (index: number) => {
                        const x = (index / (TIMELINE_DATA.length - 1)) * 100;
                        const y = 100 - TIMELINE_DATA[index].sentiment;
                        return { x, y };
                    };

                    const pathD = TIMELINE_DATA.map((_, i) => {
                        const { x, y } = getCoordinates(i);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ');

                    return (
                        <>
                            <svg
                                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#ef4444" />
                                        <stop offset="100%" stopColor="#22c55e" />
                                    </linearGradient>
                                </defs>
                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                    d={pathD}
                                    fill="none"
                                    stroke="url(#line-gradient)"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                    className="opacity-70"
                                />
                            </svg>

                            {TIMELINE_DATA.map((item, i) => {
                                const { x, y } = getCoordinates(i);
                                return (
                                    <SentimentPoint
                                        key={i}
                                        x={x}
                                        y={y}
                                        data={item}
                                        index={i}
                                        onSelect={setSelectedEvent}
                                    />
                                );
                            })}
                        </>
                    );
                })()}

            </div>

            {/* Summary Tile Overlay */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute right-4 bottom-4 w-64 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 shadow-2xl rounded-lg p-4 z-50"
                    >
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                        >
                            <X className="w-3 h-3" />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedEvent.type === 'critical' ? 'bg-red-500' :
                                selectedEvent.type === 'positive' ? 'bg-green-500' : 'bg-amber-500'
                                }`} />
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Event Summary</span>
                        </div>

                        <h3 className="text-sm font-bold text-white mb-1 leading-tight">{selectedEvent.event}</h3>
                        <p className="text-[10px] text-zinc-400 font-mono mb-4">{selectedEvent.date} // DEC_2025_LOG</p>

                        <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
                            <span className="text-[10px] text-zinc-500">Source Link</span>
                            <a
                                href={selectedEvent.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                <span>OPEN STORY</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PublicSentimentTracker;
