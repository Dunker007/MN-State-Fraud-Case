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
        <div className="flex flex-col h-full" ref={containerRef}>
            {/* Compact Single-Row Toolbar */}
            <div className="flex items-center justify-between gap-4 px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded shrink-0">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-white uppercase">Time Machine</span>
                    <span className="text-[10px] text-red-500 font-mono px-1.5 py-0.5 bg-red-950/30 rounded">
                        {snapshots.filter(s => s.has_excuse === 'True').length} BARRIERS
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFullArchive(!showFullArchive)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${showFullArchive
                            ? 'bg-blue-900/30 border-blue-500 text-blue-400'
                            : 'border-zinc-700 text-zinc-500'
                            }`}
                    >
                        {showFullArchive ? 'FULL' : '2016+'}
                    </button>
                    <button
                        onClick={() => setShowExcusesOnly(!showExcusesOnly)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${showExcusesOnly
                            ? 'bg-red-900/30 border-red-500 text-red-500'
                            : 'border-zinc-700 text-zinc-500'
                            }`}
                    >
                        {showExcusesOnly ? 'EXCUSES' : 'ALL'}
                    </button>

                    <div className="h-4 w-px bg-zinc-700" />

                    <div className="flex items-center bg-zinc-800 rounded border border-zinc-700">
                        <button onClick={prevSnapshot} disabled={activeIndex <= 0} className="p-1 hover:bg-zinc-700 disabled:opacity-30">
                            <ChevronLeft className="w-3 h-3 text-zinc-400" />
                        </button>
                        <span className="px-2 text-[10px] font-mono font-bold text-white">
                            {activeIndex + 1}/{filteredSnapshots.length}
                        </span>
                        <button onClick={nextSnapshot} disabled={activeIndex >= filteredSnapshots.length - 1} className="p-1 hover:bg-zinc-700 disabled:opacity-30">
                            <ChevronRight className="w-3 h-3 text-zinc-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Viewport - Fill remaining space */}
            <div className={`flex-1 mt-1 bg-zinc-950 border ${activeSnapshot?.has_excuse === 'True' ? 'border-red-900/50' : 'border-zinc-800'} rounded overflow-hidden relative flex flex-col min-h-0`}>
                <div className="flex-1 overflow-y-auto bg-black/40 min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSnapshot?.timestamp}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="w-full h-full flex items-center justify-center p-2"
                        >
                            {activeSnapshot ? (
                                <div className="relative max-w-full max-h-full">
                                    <img
                                        src={`/api/dhs-monitor/screenshot/${activeSnapshot.timestamp}`}
                                        alt={`DHS Snapshot ${activeSnapshot.date}`}
                                        className="max-w-full max-h-[calc(100vh-200px)] object-contain shadow-lg border border-zinc-800/50 rounded-sm"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />

                                    {/* Compact Status Badge */}
                                    {activeSnapshot.has_excuse === 'True' && (
                                        <div className="absolute top-2 right-2 bg-red-600/90 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg uppercase">
                                            ⚠ {activeSnapshot.excuse_type || 'BLOCKED'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-zinc-600 font-mono italic text-xs">NO_DATA</p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Minimal Footer */}
                <div className="shrink-0 px-3 py-1.5 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{activeSnapshot?.date}</span>
                        <span className="text-[9px] text-zinc-500">Wayback</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <a
                            href={`https://web.archive.org/web/${activeSnapshot?.timestamp}/https://licensinglookup.dhs.state.mn.us/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                            title="View"
                        >
                            <Eye className="w-3 h-3 text-white" />
                        </a>
                        <button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = `/api/dhs-monitor/screenshot/${activeSnapshot?.timestamp}`;
                                link.download = `MN_DHS_${activeSnapshot?.timestamp}.png`;
                                link.click();
                            }}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                            title="Download"
                        >
                            <Download className="w-3 h-3 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

