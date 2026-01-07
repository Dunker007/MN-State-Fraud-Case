"use client";
import React, { useState, useEffect } from 'react';
import { FileSearch, Radio } from 'lucide-react';
import Image from 'next/image';
import { ScrollingDebtCounter } from './ScrollingDebtCounter';
import HunterPhaseIndicator from './HunterPhaseIndicator';

export const CrosscheckHeader = () => {
    const [hunterPhase, setHunterPhase] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        // Sync with Server-Side Hunter Protocol Logic (approximate client sync)
        const updateCycle = () => {
            const now = new Date();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            // Determine Phase
            if (minutes < 15) setHunterPhase('PHASE 1: TARGETS');
            else if (minutes < 30) setHunterPhase('PHASE 2: HONEY POTS');
            else if (minutes < 45) setHunterPhase('PHASE 3: MECHANISMS');
            else setHunterPhase('PHASE 4: SPIDERWEB');

            // Calculate Progress (15 minute cycles)
            const cycleMinute = minutes % 15;
            const progressPercent = ((cycleMinute * 60 + seconds) / (15 * 60)) * 100;
            setProgress(progressPercent);
        };

        updateCycle();
        const interval = setInterval(updateCycle, 1000); // Check every second for smooth progress
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="sticky top-0 z-[60] w-full bg-[#050505] border-b border-slate-800 py-2 shadow-2xl">
            <div className="w-full max-w-[95%] lg:max-w-none mx-auto lg:mx-0 px-4 lg:px-8 flex flex-row justify-between items-center gap-6">

                {/* BRAND IDENTITY */}
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                        {/* The Official PROJECT CROSSCHECK Logo */}
                        <Image
                            src="/assets/logos/crosscheck-literal.png"
                            alt="Project CrossCheck"
                            width={64}
                            height={64}
                            className="w-full h-full object-contain invert saturate-0 brightness-200 contrast-125"
                            priority
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter uppercase italic leading-none">
                            <span className="text-red-600">PROJECT</span> <span className="text-white">CROSS</span><span className="text-blue-500">CHECK</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="hidden md:inline-block bg-red-950/40 border border-red-900 text-red-400 text-[9px] font-bold px-1.5 py-px rounded tracking-widest uppercase animate-pulse">
                                Active Investigation
                            </span>
                            <span className="text-slate-500 font-mono text-[10px] tracking-widest uppercase">
                                MN-DHS CASE #2025-X9
                            </span>
                        </div>
                    </div>
                </div>

                {/* DEBT COUNTER (Visible Desktop & Mobile) */}
                <div className="hidden md:block">
                    <ScrollingDebtCounter />
                </div>

                {/* LIVE METRICS (Visible on all screens) */}
                <div className="flex gap-4 text-right">
                    {/* HUNT STATUS */}
                    <a
                        href="https://github.com/Dunker007/MN-State-Fraud-Case/actions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-slate-900/50 p-2 -m-2 rounded transition-colors cursor-pointer group"
                        title="View System Status / Trigger Manual Fetch"
                    >
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center justify-end gap-1 group-hover:text-slate-300">
                            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                            Hunter Protocol
                        </p>
                        <div className="relative">
                            <p className="text-lg md:text-2xl font-mono font-bold text-emerald-500 uppercase group-hover:text-emerald-400">
                                {hunterPhase || 'INITIALIZING...'}
                            </p>
                            {/* Phase Progress Bar */}
                            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-900/30 overflow-hidden rounded-full">
                                <div
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-linear"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </a>
                    <div className="hidden sm:block border-l border-slate-800 pl-6">
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Targets Identified</p>
                        <p className="text-lg md:text-2xl font-mono font-bold text-red-500 flex items-center justify-end gap-2">
                            22,087 <FileSearch className="w-4 h-4 opacity-50" />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
