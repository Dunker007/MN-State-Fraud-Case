"use client";
import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import Image from 'next/image';

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
        <div className="sticky top-0 z-[60] w-full bg-[#050505]/95 backdrop-blur-sm border-b border-zinc-800/80">
            <div className="w-full max-w-[95%] lg:max-w-none mx-auto lg:mx-0 px-4 lg:px-6 py-1.5 flex items-center justify-between gap-4">

                {/* LEFT: Brand + Case ID */}
                <div className="flex items-center gap-3">
                    <Image
                        src="/assets/logos/crosscheck-literal.png"
                        alt="Project CrossCheck"
                        width={40}
                        height={40}
                        className="w-8 h-8 md:w-10 md:h-10 object-contain invert saturate-0 brightness-200 contrast-125"
                        priority
                    />
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic leading-none">
                            <span className="text-red-600">PROJECT</span> <span className="text-white">CROSS</span><span className="text-blue-500">CHECK</span>
                        </h1>
                        <span className="hidden md:inline text-zinc-600 font-mono text-[10px]">
                            #2025-X9
                        </span>
                    </div>
                </div>

                {/* CENTER: Stats Bar */}
                <div className="hidden lg:flex items-center gap-6 px-4 py-1 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Diversion</span>
                        <span className="text-base font-mono font-black text-amber-500">$9B</span>
                    </div>
                    <div className="h-4 w-px bg-zinc-700" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Targets</span>
                        <span className="text-base font-mono font-black text-red-500">22,087</span>
                    </div>
                    <div className="h-4 w-px bg-zinc-700" />
                    <div className="flex items-center gap-2">
                        <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                        <span className="text-sm font-mono font-bold text-emerald-500 uppercase">
                            {hunterPhase || 'SYNC...'}
                        </span>
                        {/* Mini progress bar */}
                        <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Mobile-visible compact stats */}
                <div className="flex lg:hidden items-center gap-3 text-xs font-mono">
                    <span className="text-amber-500 font-bold">$9B</span>
                    <span className="text-red-500 font-bold">22K</span>
                    <div className="flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                        <span className="text-emerald-500 font-bold">P4</span>
                    </div>
                </div>

                {/* RIGHT: System Status */}
                <a
                    href="https://github.com/Dunker007/MN-State-Fraud-Case/actions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-950/30 border border-emerald-900/50 rounded hover:bg-emerald-900/30 transition-colors"
                    title="System Status"
                >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">SYSTEM ONLINE</span>
                </a>
            </div>
        </div>
    );
};
