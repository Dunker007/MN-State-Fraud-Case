'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Maximize2,
    Clock,
    ShieldAlert,
    ShieldCheck,
    ChevronDown
} from 'lucide-react';
import { MOCK_NEWS } from './ScandalNewsFeed';

interface Snapshot {
    timestamp: string;
    date: string;
    http_status: string;
    has_excuse: string;
    excuse_type: string;
    file_size: string;
    filename: string;
}

export default function ForensicTimeMachine({ onDateChange }: { onDateChange?: (date: string) => void }) {
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [_isFullscreen, _setIsFullscreen] = useState(false);
    const [showExcusesOnly, setShowExcusesOnly] = useState(false);
    const [showFullArchive, setShowFullArchive] = useState(true); // Default to full history
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchArchive() {
            try {
                const res = await fetch('/api/dhs-monitor?action=visual-archive');
                const data = await res.json();
                if (data.success) {
                    setSnapshots(data.snapshots);
                    // Start at the most recent snapshot
                    setCurrentIndex(data.snapshots.length - 1);
                }
            } catch (err) {
                console.error('Failed to fetch visual archive:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchArchive();
    }, []);

    const filteredSnapshots = useMemo(() => {
        let list = snapshots;

        // 1. Filter by Era
        if (!showFullArchive) {
            list = list.filter(s => {
                const year = parseInt(s.timestamp.slice(0, 4));
                return year >= 2007;
            });
        }

        // 2. Filter by Excuses
        if (showExcusesOnly) {
            list = list.filter(s => s.has_excuse === 'True');
        }

        return list;
    }, [snapshots, showExcusesOnly, showFullArchive]);

    // Adjust indicator index when list is filtered
    const activeIndex = useMemo(() => {
        if (filteredSnapshots.length === 0) return -1;
        // If the current index snapshot is in the filtered list, use it
        // Otherwise, pick the closest one
        const currentId = snapshots[currentIndex]?.timestamp;
        const found = filteredSnapshots.findIndex(s => s.timestamp === currentId);
        return found !== -1 ? found : filteredSnapshots.length - 1;
    }, [filteredSnapshots, snapshots, currentIndex]);

    const activeSnapshot = filteredSnapshots[activeIndex];

    const scandalCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        MOCK_NEWS.forEach(article => {
            const year = article.date.split('-')[0];
            counts[year] = (counts[year] || 0) + 1;
        });
        return counts;
    }, []);

    const timelineTicks = useMemo(() => {
        const start = new Date(2007, 0, 1);
        const end = new Date();
        const ticks = [];
        let curr = new Date(start);

        // Group snapshots by week-key
        const snapshotsByWeek: Record<string, Snapshot[]> = {};
        filteredSnapshots.forEach(s => {
            const d = new Date(s.date);
            const weekKey = `${d.getFullYear()}-W${Math.floor(d.getDate() / 7)}`;
            if (!snapshotsByWeek[weekKey]) snapshotsByWeek[weekKey] = [];
            snapshotsByWeek[weekKey].push(s);
        });

        while (curr <= end) {
            const weekKey = `${curr.getFullYear()}-W${Math.floor(curr.getDate() / 7)}`;
            const year = curr.getFullYear().toString();
            const snaps = snapshotsByWeek[weekKey] || [];

            ticks.push({
                key: weekKey,
                dateLabel: curr.toISOString().split('T')[0],
                year,
                hasExcuse: snaps.some(s => s.has_excuse === 'True'),
                hasSnapshot: snaps.length > 0,
                storyCount: scandalCounts[year] || 0,
                firstSnapIdx: snaps.length > 0 ? snapshots.findIndex(sn => sn.timestamp === snaps[0].timestamp) : -1
            });
            curr.setDate(curr.getDate() + 7);
        }
        return ticks;
    }, [filteredSnapshots, scandalCounts, snapshots]);

    const _activeTickIdx = useMemo(() => {
        if (!activeSnapshot) return 0;
        const date = new Date(activeSnapshot.date).getTime();
        const start = new Date(2007, 0, 1).getTime();
        const weekIdx = Math.floor((date - start) / (7 * 86400000));
        return Math.max(0, Math.min(weekIdx, timelineTicks.length - 1));
    }, [activeSnapshot, timelineTicks]);

    useEffect(() => {
        if (activeSnapshot && scrollRef.current) {
            const date = new Date(activeSnapshot.date);
            const weekKey = `${date.getFullYear()}-W${Math.floor(date.getDate() / 7)}`;
            const tickEl = scrollRef.current.querySelector(`[data-week="${weekKey}"]`);
            if (tickEl) {
                tickEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeSnapshot]);

    useEffect(() => {
        if (activeSnapshot && onDateChange) {
            onDateChange(activeSnapshot.date);
        }
    }, [activeSnapshot, onDateChange]);

    const nextSnapshot = () => {
        if (activeIndex < filteredSnapshots.length - 1) {
            const nextSnap = filteredSnapshots[activeIndex + 1];
            const realIdx = snapshots.findIndex(s => s.timestamp === nextSnap.timestamp);
            setCurrentIndex(realIdx);
        }
    };

    const prevSnapshot = () => {
        if (activeIndex > 0) {
            const prevSnap = filteredSnapshots[activeIndex - 1];
            const realIdx = snapshots.findIndex(s => s.timestamp === prevSnap.timestamp);
            setCurrentIndex(realIdx);
        }
    };

    if (loading) {
        return (
            <div className="h-[500px] flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-mono text-zinc-500 animate-pulse">LOADING_VISUAL_HISTORY_DB...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6" ref={containerRef}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black italic text-white tracking-tight uppercase flex items-center gap-3">
                        <History className="w-6 h-6 text-blue-500" />
                        Forensic Visual Time Machine
                    </h2>
                    <p className="text-zinc-500 font-mono text-xs mt-1">
                        Scanning 19 Years of DHS Interface Evolution & Defensive Maneuvers
                    </p>
                </div>

                {/* Active Investigation Ticker */}
                <div className="flex-1 max-w-2xl px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-8 shadow-2xl overflow-hidden">
                    <div className="flex flex-col">
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Barriers_Detected</div>
                        <div className="text-xl font-black text-white font-mono italic leading-none">
                            {snapshots.filter(s => s.has_excuse === 'True').length}
                        </div>
                    </div>
                    <div className="h-10 w-px bg-zinc-800" />
                    <div className="flex flex-col">
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Suppression_Tech</div>
                        <div className="text-xl font-black text-red-500 font-mono italic leading-none flex items-center gap-2">
                            {snapshots.some(s => s.excuse_type?.toLowerCase().includes('radware')) ? 'RADWARE AI' : 'NONE_DETECTED'}
                        </div>
                    </div>
                    <div className="h-10 w-px bg-zinc-800" />
                    <div className="flex flex-col text-right">
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Scandal_Overlap_Score</div>
                        <div className="text-xl font-black text-amber-500 font-mono italic leading-none">
                            {Math.min(99, Math.round((snapshots.filter(s => s.has_excuse === 'True').length / snapshots.length) * 500))}%
                        </div>
                    </div>

                    {/* Pulsing Scan Indicator */}
                    <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-zinc-800">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                            <div className="absolute inset-0 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                        </div>
                        <div className="text-[10px] font-mono text-blue-400 font-black uppercase tracking-tighter leading-tight italic">
                            Scanning<br />Nexus_Sync
                        </div>
                    </div>
                </div>

                <div className="hidden xl:flex flex-1 justify-center">
                    <div className="flex items-center gap-8 px-16 py-7.5 bg-blue-950/20 border-2 border-blue-500/30 rounded-full backdrop-blur-md shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                        <span className="text-blue-400 font-mono text-[22px] font-black tracking-[0.5em] uppercase italic">
                            Captured Evidence
                        </span>
                        <ChevronDown className="w-12 h-12 text-blue-500 animate-bounce" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFullArchive(!showFullArchive)}
                        className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic border-2 transition-all ${showFullArchive
                            ? 'bg-blue-900/30 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                            }`}
                        title={showFullArchive ? "Focus on Investigation Era (2016+)" : "Show Full 19-Year History"}
                    >
                        {showFullArchive ? 'FULL_ARCHIVE_2007' : 'INVESTIGATION_ERA_2016'}
                    </button>

                    <button
                        onClick={() => setShowExcusesOnly(!showExcusesOnly)}
                        className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic border-2 flex items-center gap-3 transition-all ${showExcusesOnly
                            ? 'bg-red-900/30 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                            }`}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        {showExcusesOnly ? 'EXCUSES_ONLY' : 'ALL_INCIDENTS'}
                    </button>

                    <div className="flex bg-zinc-900/80 border-2 border-zinc-800 rounded-xl p-1 shadow-2xl">
                        <button
                            onClick={prevSnapshot}
                            disabled={activeIndex <= 0}
                            className="p-2 hover:bg-zinc-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <div className="px-4 flex items-center font-mono text-lg font-black italic text-white min-w-[100px] justify-center tracking-tighter">
                            {activeIndex + 1} / {filteredSnapshots.length}
                        </div>
                        <button
                            onClick={nextSnapshot}
                            disabled={activeIndex >= filteredSnapshots.length - 1}
                            className="p-2 hover:bg-zinc-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Timeline Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-hidden h-fit max-h-[600px] flex flex-col">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            <span className="text-[20px] font-black uppercase tracking-widest text-zinc-400">Chronological Index</span>
                        </div>

                        <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar flex-1">
                            {[...filteredSnapshots].reverse().map((snap, i) => {
                                const isSelected = snap.timestamp === activeSnapshot?.timestamp;
                                return (
                                    <button
                                        key={snap.timestamp}
                                        onClick={() => {
                                            const realIdx = snapshots.findIndex(s => s.timestamp === snap.timestamp);
                                            setCurrentIndex(realIdx);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${isSelected
                                            ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50'
                                            : snap.has_excuse === 'True'
                                                ? 'bg-red-950/10 border-red-900/50 hover:border-red-500/50'
                                                : 'bg-amber-950/10 border-amber-900/50 hover:border-amber-500/50'
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <div className={`text-[20px] font-bold ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`}>
                                                {snap.date}
                                            </div>
                                            <div className={`text-[18px] font-black uppercase tracking-tighter ${snap.has_excuse === 'True' ? 'text-red-500' :
                                                parseInt(snap.timestamp.slice(0, 4)) < 2016 ? 'text-amber-700' : 'text-amber-500/80'
                                                }`}>
                                                {snap.has_excuse === 'True'
                                                    ? 'Barrier Detected'
                                                    : parseInt(snap.timestamp.slice(0, 4)) < 2016
                                                        ? 'Historical Baseline'
                                                        : 'Era Surveillance'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[24px] font-mono font-black ${isSelected ? 'text-white' : snap.has_excuse === 'True' ? 'text-red-400/70' : 'text-amber-500/60'}`}>
                                                {snap.timestamp?.length >= 14
                                                    ? `${snap.timestamp.slice(8, 10)}:${snap.timestamp.slice(10, 12)}`
                                                    : '00:00'
                                                }
                                            </div>
                                            {snap.has_excuse === 'True' && (
                                                <div className="flex justify-end">
                                                    <AlertTriangle className={`w-3 h-3 ${isSelected ? 'text-red-400' : 'text-red-600'}`} />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {activeSnapshot && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Maximize2 className="w-5 h-5 text-zinc-500" />
                                <span className="text-[20px] font-black uppercase tracking-widest text-zinc-400">Snapshot Metadata</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[20px] font-mono">
                                <div className="p-3 bg-black rounded border border-zinc-800">
                                    <div className="text-zinc-600 mb-1">HTTP STATUS</div>
                                    <div className={`font-bold ${activeSnapshot.http_status === '200' ? 'text-green-500' : 'text-amber-500'}`}>
                                        {activeSnapshot.http_status}
                                    </div>
                                </div>
                                <div className="p-3 bg-black rounded border border-zinc-800">
                                    <div className="text-zinc-600 mb-1">TIMESTAMP</div>
                                    <div className="text-white font-bold">{activeSnapshot.timestamp}</div>
                                </div>
                                {activeSnapshot.excuse_type && (
                                    <div className="p-3 bg-red-950/20 rounded border border-red-900 col-span-2">
                                        <div className="text-red-500/60 mb-1 font-black">THREAT_IDENTIFIED</div>
                                        <div className="text-red-400 font-bold uppercase">{activeSnapshot.excuse_type}</div>
                                        {activeSnapshot.excuse_type.toLowerCase().includes('radware') && (
                                            <div className="mt-2 p-2 bg-red-950/40 border border-red-500/30 text-[14px] leading-tight text-red-200 italic">
                                                RADWARE: AI-driven traffic suppression acting as a defensive blockade.
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded col-span-2">
                                    <div className="text-zinc-600 mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5" />
                                        INVESTIGATIVE_RATIONALE
                                    </div>
                                    <div className="text-zinc-300 font-bold leading-relaxed italic text-[18px]">
                                        {activeSnapshot.has_excuse === 'True'
                                            ? "ACTIVE_BARRIER_DETECTED: This frame captures an explicit access restriction or system excuse. Critical evidence of service degradation."
                                            : parseInt(activeSnapshot.timestamp.slice(0, 4)) < 2016
                                                ? "BASELINE_TRANSPARENCY: Verified historical state. Serves as the forensic baseline for pre-conflict site transparency."
                                                : "SURVEILLANCE_INDEX: Monitoring during conflict era. Selected for comparison against known excuse patterns."
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Viewport */}
                <div className="lg:col-span-3 space-y-4 relative">
                    <div className={`bg-zinc-950 border-2 ${activeSnapshot?.has_excuse === 'True' ? 'border-red-900/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-zinc-800 shadow-2xl'} rounded-xl overflow-hidden relative group h-[700px] flex flex-col`}>
                        <div className="flex-1 overflow-y-auto bg-black/40 [scrollbar-width:thick] [scrollbar-color:theme(colors.amber.500)_theme(colors.zinc.950)] [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-amber-500/80 [&::-webkit-scrollbar-thumb]:rounded-none hover:[&::-webkit-scrollbar-thumb]:bg-amber-400">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSnapshot?.timestamp}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full flex items-start justify-center p-4"
                                >
                                    {activeSnapshot ? (
                                        <div className="relative inline-block mx-auto group/image">
                                            <img
                                                src={`/api/dhs-monitor/screenshot/${activeSnapshot.timestamp}`}
                                                alt={`DHS Snapshot ${activeSnapshot.date}`}
                                                className="max-w-full h-auto object-contain shadow-2xl border border-zinc-800/50 rounded-sm"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        const errorMsg = document.createElement('div');
                                                        errorMsg.className = "flex flex-col items-center justify-center p-20 text-zinc-600 font-mono italic text-center text-red-500";
                                                        errorMsg.innerHTML = `<svg class="w-12 h-12 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7m4 0h5v5m-9 4 9-9" /></svg><p>FORENSIC_IMAGE_LOAD_FAILURE: ${activeSnapshot.timestamp}</p><p class="text-[10px] mt-2 non-italic text-zinc-600">Snapshot may be corrupted or still rendering.</p>`;
                                                        parent.appendChild(errorMsg);
                                                    }
                                                }}
                                            />

                                            {/* Forensic Status Banners (Tape Style) - Relocated to Document White Space */}
                                            <div className="absolute top-[380px] left-[540px] flex flex-col gap-3 z-30 transform -rotate-3 scale-90 md:scale-125">
                                                {/* Red Tape: Evidence Detected */}
                                                {activeSnapshot.has_excuse === 'True' && (
                                                    <div className="group relative">
                                                        <div className="bg-red-600 text-white font-black text-[16px] px-8 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] border-l-[12px] border-red-400 whitespace-nowrap uppercase tracking-tighter ring-2 ring-black/40 cursor-help transition-transform group-hover:scale-105">
                                                            EVIDENCE DETECTED: {activeSnapshot.excuse_type || 'RESTRICTION'}
                                                        </div>
                                                        <div className="absolute bottom-full mb-3 left-0 right-0 p-4 bg-red-950 border-2 border-red-500 text-red-500 text-[11px] font-mono leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-40 shadow-[0_20px_50px_rgba(0,0,0,0.8)] translate-y-2 group-hover:translate-y-0">
                                                            <div className="font-black mb-2 text-red-400 uppercase tracking-[0.2em] border-b border-red-900 pb-1">Threat Analysis</div>
                                                            Direct evidence of system-level interference. This capture confirms an explicit {activeSnapshot.excuse_type || 'access restriction'} used to degrade dashboard transparency.
                                                            {(activeSnapshot.excuse_type || '').toLowerCase().includes('radware') && (
                                                                <div className="mt-3 pt-2 border-t border-red-900/50 text-[10px] italic text-red-200/80">
                                                                    RADWARE: AI-driven traffic suppression acting as a defensive blockade.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Yellow Tape: Investigative Rationale */}
                                                <div className="group relative">
                                                    <div className="bg-amber-500 text-black font-black text-[13px] px-8 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] border-l-[12px] border-amber-300 whitespace-nowrap uppercase tracking-tighter ring-2 ring-black/40 cursor-help transition-transform group-hover:scale-105">
                                                        INVESTIGATIVE RATIONALE: {
                                                            activeSnapshot.has_excuse === 'True'
                                                                ? "ACTIVE_BARRIER"
                                                                : parseInt(activeSnapshot.timestamp.slice(0, 4)) < 2016
                                                                    ? "BASELINE_STATE"
                                                                    : "SURVEILLANCE_POINT"
                                                        }
                                                    </div>
                                                    <div className="absolute top-full mt-3 left-0 right-0 p-4 bg-zinc-950 border-2 border-amber-500 text-amber-500 text-[11px] font-mono leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-40 shadow-[0_20px_50px_rgba(0,0,0,0.8)] -translate-y-2 group-hover:translate-y-0">
                                                        <div className="font-black mb-2 text-amber-500 uppercase tracking-[0.2em] border-b border-zinc-800 pb-1">Case Logic</div>
                                                        {activeSnapshot.has_excuse === 'True'
                                                            ? "ACTIVE_BARRIER: Confirmed system blockade. This capture represents an active denial of service or transparency restriction used as a defensive maneuver."
                                                            : parseInt(activeSnapshot.timestamp.slice(0, 4)) < 2016
                                                                ? "BASELINE_STATE: Historical transparency baseline. Verified pre-conflict era state used to establish normal site behavior and accessibility."
                                                                : "SURVEILLANCE_POINT: Targeted monitoring during conflict era. Selected to detect subtle layout shifts or 'stealth-blocking' compared against known baseline states."
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            <p className="text-zinc-600 font-mono italic px-12 text-center">NO_SNAPSHOT_DATA_AT_THIS_INDEX</p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Overlay Controls - Always Visible */}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <div className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Historical Evidence</div>
                                        <div className="text-xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
                                            {activeSnapshot?.date}
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-zinc-800 hidden md:block" />
                                    <div className="hidden md:flex flex-col">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Source</div>
                                        <div className="text-xs text-zinc-400 font-mono">
                                            Wayback Machine CDX Archive
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={`https://web.archive.org/web/${activeSnapshot?.timestamp}/https://licensinglookup.dhs.state.mn.us/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors"
                                        title="View on Wayback Machine"
                                    >
                                        <Eye className="w-5 h-5 text-white" />
                                    </a>
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = `/api/dhs-monitor/screenshot/${activeSnapshot?.timestamp}`;
                                            link.download = `MN_DHS_Snapshot_${activeSnapshot?.timestamp}.png`;
                                            link.click();
                                        }}
                                        className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors"
                                        title="Download Forensic Evidence"
                                    >
                                        <Download className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Tactical Scrub Bar */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History className="w-6 h-6 text-blue-500" />
                                <span className="text-[20px] font-black uppercase text-zinc-400 tracking-tighter">Temporal scrubbing station</span>
                            </div>
                            <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[20px] font-mono font-bold text-blue-400">
                                {activeSnapshot?.date} • INDEX_IMAGE-{activeIndex + 1}
                            </div>
                        </div>

                        <div className="relative group/scrubber pt-12 pb-12">
                            {/* High-Resolution Double-Stack Heatmap */}
                            <div className="absolute inset-x-0 top-0 h-14 flex flex-col gap-1 px-1 z-20">
                                {/* Top Row: Red Ticks Only */}
                                <div className="h-4 flex gap-[1px]">
                                    {filteredSnapshots.map((s, i) => (
                                        <button
                                            key={`red-${i}`}
                                            onClick={() => {
                                                const realIdx = snapshots.findIndex(snap => snap.timestamp === s.timestamp);
                                                setCurrentIndex(realIdx);
                                            }}
                                            className={`flex-1 h-full rounded-[1px] transition-all hover:scale-y-150 hover:z-30 hover:opacity-100 ${s.has_excuse === 'True'
                                                ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                                                : 'bg-zinc-900/10 hover:bg-zinc-700/50'
                                                }`}
                                            title={`Jump to ${s.date} (Index ${i + 1})`}
                                        />
                                    ))}
                                </div>
                                {/* Middle Row: Yellow Ticks Only (Rationale/Baseline) */}
                                <div className="h-4 flex gap-[1px]">
                                    {filteredSnapshots.map((s, i) => (
                                        <button
                                            key={`yellow-${i}`}
                                            onClick={() => {
                                                const realIdx = snapshots.findIndex(snap => snap.timestamp === s.timestamp);
                                                setCurrentIndex(realIdx);
                                            }}
                                            className="flex-1 h-full rounded-[1px] bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)] transition-all hover:bg-amber-400 hover:scale-y-150 hover:z-30 hover:shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse"
                                            title={`Rationale: ${s.date} (Index ${i + 1})`}
                                        />
                                    ))}
                                </div>
                                {/* Bottom Row: Blue Ticks (Scandal Hits) */}
                                <div className="h-4 flex gap-[1px]">
                                    {filteredSnapshots.map((s, i) => {
                                        const year = s.timestamp.slice(0, 4);
                                        const storyCount = scandalCounts[year] || 0;
                                        const hasScandal = storyCount > 0;
                                        // Intensity Scale: 1 story = 20%, 5+ stories = 100%
                                        const intensity = Math.min(storyCount, 5);
                                        const opacityValue = intensity * 0.2;

                                        return (
                                            <button
                                                key={`blue-${i}`}
                                                onClick={() => {
                                                    const realIdx = snapshots.findIndex(snap => snap.timestamp === s.timestamp);
                                                    setCurrentIndex(realIdx);
                                                }}
                                                className={`flex-1 h-full rounded-[1px] transition-all hover:scale-y-150 hover:z-30 ${hasScandal
                                                    ? 'bg-blue-500'
                                                    : 'bg-zinc-900/10 hover:bg-zinc-700/50'}`}
                                                style={{
                                                    opacity: hasScandal ? opacityValue : undefined,
                                                    boxShadow: hasScandal ? `0 0 ${intensity * 4}px rgba(59,130,246, ${opacityValue})` : undefined
                                                }}
                                                title={`Scandal Context: ${s.date} (${storyCount} Reports)`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max={filteredSnapshots.length - 1}
                                value={activeIndex}
                                onChange={(e) => {
                                    const idx = parseInt(e.target.value);
                                    const snap = filteredSnapshots[idx];
                                    if (snap) {
                                        const realIdx = snapshots.findIndex(s => s.timestamp === snap.timestamp);
                                        setCurrentIndex(realIdx);
                                    }
                                }}
                                className="w-full h-1.5 bg-zinc-800/50 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 relative z-10"
                            />


                            {/* Dynamic Year Ticks */}
                            <div className="absolute inset-x-0 bottom-0 flex justify-between px-0.5">
                                {Array.from({ length: 2026 - (showFullArchive ? 2007 : 2016) + 1 }).map((_, i) => {
                                    const startYear = showFullArchive ? 2007 : 2016;
                                    const year = startYear + i;
                                    const totalYears = 2026 - startYear;
                                    // Show labels for first, last, and sensible middle intervals
                                    const shouldShowLabel = i === 0 || i === totalYears || (totalYears > 10 ? i % 4 === 0 : i % 2 === 0);
                                    return (
                                        <div key={year} className="flex flex-col items-center">
                                            <div className={`w-px h-1 ${shouldShowLabel ? 'bg-zinc-600' : 'bg-zinc-800'}`} />
                                            {shouldShowLabel && (
                                                <span className="text-[20px] font-black font-mono text-zinc-500 mt-4 select-none">
                                                    {year}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const snap = filteredSnapshots[0];
                                        setCurrentIndex(snapshots.findIndex(s => s.timestamp === snap.timestamp));
                                    }}
                                    className="p-2 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                                    title="Jump to Start"
                                >
                                    <ChevronLeft className="w-4 h-4 stroke-[3px]" />
                                    <ChevronLeft className="w-4 h-4 -ml-3 stroke-[3px]" />
                                </button>
                                <button
                                    onClick={prevSnapshot}
                                    disabled={activeIndex <= 0}
                                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-zinc-900 transition-all flex items-center gap-2 text-[10px] font-black tracking-widest"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    PREV_FRAME
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={nextSnapshot}
                                    disabled={activeIndex >= filteredSnapshots.length - 1}
                                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-zinc-900 transition-all flex items-center gap-2 text-[10px] font-black tracking-widest"
                                >
                                    NEXT_FRAME
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        const snap = filteredSnapshots[filteredSnapshots.length - 1];
                                        setCurrentIndex(snapshots.findIndex(s => s.timestamp === snap.timestamp));
                                    }}
                                    className="p-2 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                                    title="Jump to Current"
                                >
                                    <ChevronRight className="w-4 h-4 stroke-[3px]" />
                                    <ChevronRight className="w-4 h-4 -ml-3 stroke-[3px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
