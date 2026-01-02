"use client";
import React, { useState, useEffect } from 'react';
import { FileSearch, Radio } from 'lucide-react';
import Image from 'next/image';

export const CrosscheckHeader = () => {
    const [hunterPhase, setHunterPhase] = useState<string>('');

    useEffect(() => {
        // Sync with Server-Side Hunter Protocol Logic (approximate client sync)
        const updatePhase = () => {
            const minutes = new Date().getMinutes();
            if (minutes < 15) setHunterPhase('TARGETS');
            else if (minutes < 30) setHunterPhase('HONEY POTS');
            else if (minutes < 45) setHunterPhase('MECHANISMS');
            else setHunterPhase('SPIDERWEB');
        };

        updatePhase();
        const interval = setInterval(updatePhase, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-[#050505] border-b border-slate-800 pb-8 pt-4">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-end gap-6">

                {/* BRAND IDENTITY */}
                <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        {/* The Official PROJECT CROSSCHECK Logo */}
                        <Image
                            src="/assets/logos/crosscheck-literal.png"
                            alt="Project CrossCheck"
                            width={96}
                            height={96}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </div>

                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                            PROJECT <span className="text-red-600">CROSS</span>CHECK
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="bg-red-950/40 border border-red-900 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase animate-pulse">
                                Active Investigation
                            </span>
                            <span className="text-slate-500 font-mono text-xs tracking-widest uppercase">
                                MN-DHS CASE FILE #2025-X9
                            </span>
                        </div>
                    </div>
                </div>

                {/* LIVE METRICS */}
                <div className="flex gap-6 text-right">
                    {/* HUNT STATUS */}
                    <div className="hidden lg:block">
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                            Hunter Protocol
                        </p>
                        <p className="text-2xl font-mono font-bold text-emerald-500 uppercase">
                            {hunterPhase || 'INITIALIZING...'}
                        </p>
                    </div>

                    <div className="border-l border-slate-800 pl-6">
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Total Diversion</p>
                        <p className="text-2xl font-mono font-bold text-white">$9,000,000,000</p>
                    </div>
                    <div className="border-l border-slate-800 pl-6">
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Targets Identified</p>
                        <p className="text-2xl font-mono font-bold text-red-500 flex items-center justify-end gap-2">
                            19,419 <FileSearch className="w-4 h-4 opacity-50" />
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
