"use client";

import { useEffect, useState } from 'react';
import GlitchText from './GlitchText';

interface DoomsdayClockProps {
    projectedDate: Date;
    burnRate: number;
}

export default function DoomsdayClock({ projectedDate, burnRate }: DoomsdayClockProps) {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number, ms: number }>({ d: 0, h: 0, m: 0, s: 0, ms: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(projectedDate).getTime();
            const distance = target - now;

            if (distance < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000),
                ms: Math.floor((distance % 1000) / 10)
            });
        }, 30); // Fast update for MS counter

        return () => clearInterval(interval);
    }, [projectedDate]);

    return (
        <div className="bg-black border border-red-900/50 p-6 relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-end mb-6 border-b border-red-900/30 pb-2">
                <h3 className="text-red-500 font-mono text-sm tracking-[0.2em] font-bold">
                    <GlitchText text="INSOLVENCY_PROTOCOL" />
                </h3>
                <span className="text-[10px] text-red-800 font-mono">SEQ_ID: 99-AD</span>
            </div>

            {/* The Main Clock */}
            <div className="flex items-baseline justify-center gap-1 font-mono tabular-nums tracking-tighter text-red-500 scale-y-110">
                <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-black">{timeLeft.d.toString().padStart(3, '0')}</span>
                    <span className="text-[10px] text-red-800">DAYS</span>
                </div>
                <span className="text-4xl text-red-800 self-start mt-2">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-black">{timeLeft.h.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] text-red-800">HRS</span>
                </div>
                <span className="text-4xl text-red-800 self-start mt-2">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-black">{timeLeft.m.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] text-red-800">MIN</span>
                </div>
                <span className="text-4xl text-red-800 self-start mt-2">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-black">{timeLeft.s.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] text-red-800">SEC</span>
                </div>
            </div>

            {/* Millisecond Scrambler */}
            <div className="absolute right-2 top-2 text-[10px] text-red-900 font-mono">
                .{timeLeft.ms.toString().padStart(2, '0')}
            </div>

            {/* Bottom Metrics */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-red-900/30 pt-4">
                <div>
                    <span className="block text-[10px] text-red-700 mb-1">BURN_VELOCITY</span>
                    <span className="text-xl text-red-400 font-bold font-mono">-${burnRate.toFixed(2)}M<span className="text-xs opacity-50">/DAY</span></span>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] text-red-700 mb-1">IMPACT_DATE</span>
                    <span className="text-sm text-red-400 font-mono">{projectedDate.toISOString().split('T')[0]}</span>
                </div>
            </div>

            {/* Decor Elements */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500" />
        </div>
    );
}
