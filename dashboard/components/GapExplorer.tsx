"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronRight, ChevronLeft, Calendar, AlertTriangle, EyeOff, ShieldAlert } from "lucide-react";
import { gapAnalysis, type DailyGapData } from "@/lib/gap_data";

interface GapExplorerProps {
    selectedDay: number;
    setSelectedDay: (day: number) => void;
}

export default function GapExplorer({ selectedDay, setSelectedDay }: GapExplorerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const currentData = gapAnalysis.daily_data[selectedDay];

    // Story Mode Auto-Advance
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                if (selectedDay >= gapAnalysis.total_days) {
                    setIsPlaying(false);
                } else {
                    setSelectedDay(selectedDay + 1);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, selectedDay, setSelectedDay]);

    // Scroll to selected day
    useEffect(() => {
        if (scrollContainerRef.current) {
            // Simple logic: scroll only if needed?
        }
    }, [selectedDay]);

    const getDayColor = (day: DailyGapData) => {
        if (day.event_type === "SUSPENSION") return "bg-red-900 border-red-500 text-white";
        if (day.event_type === "FBI_RAID") return "bg-neon-red border-white animate-pulse text-black font-bold";
        if (day.event_type === "PUBLIC_ANNOUNCEMENT") return "bg-neon-blue border-white text-black font-bold";
        if (day.day_number > 37) return "bg-red-950/80 border-red-900/50 text-red-500"; // Deepening deception
        return "bg-amber-900/20 border-amber-900/30 text-amber-500"; // Public unaware
    };

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <EyeOff className="w-5 h-5 text-neon-red" />
                        THE 64-DAY GAP
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono">
                        OCT 9 — DEC 12, 2024
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white font-mono transition-colors"
                    >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isPlaying ? "PAUSE REPLAY" : "PLAY STORY"}
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-8 gap-2 mb-6">
                {gapAnalysis.daily_data.map((day) => (
                    <button
                        key={day.day_number}
                        onClick={() => {
                            setSelectedDay(day.day_number);
                            setIsPlaying(false);
                        }}
                        className={`
                            aspect-square rounded p-1 flex flex-col items-center justify-center border transition-all relative
                            ${getDayColor(day)}
                            ${selectedDay === day.day_number ? 'ring-2 ring-white scale-110 z-10 shadow-xl' : 'hover:scale-105 hover:bg-zinc-800'}
                        `}
                    >
                        <span className="text-[10px] font-mono leading-none mb-1">DAY</span>
                        <span className="text-lg font-bold leading-none">{day.day_number}</span>
                        {day.event_type !== "SILENCE" && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white animate-ping" />
                        )}
                    </button>
                ))}
            </div>

            {/* Impact Counters */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/50 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase">Transactions Hidden</div>
                    <div className="text-xl font-mono text-white">
                        ${(currentData.estimated_daily_transactions * (currentData.day_number + 1)).toLocaleString()}
                    </div>
                </div>
                <div className="bg-black/50 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase">Days of Silence</div>
                    <div className="text-xl font-mono text-neon-red">
                        {currentData.day_number} / 64
                    </div>
                </div>
            </div>
        </section>
    );
}
