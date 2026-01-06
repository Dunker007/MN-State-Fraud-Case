"use client";

import { useEffect, useState } from 'react';

interface FundGaugeProps {
    currentBalance: number;  // Current fund balance in millions
    initialBalance: number;  // Starting fund balance in millions (e.g., 500)
}

export default function FundGauge({ currentBalance, initialBalance }: FundGaugeProps) {
    const [animatedPercent, setAnimatedPercent] = useState(100);

    const healthPercent = Math.max(0, Math.min(100, (currentBalance / initialBalance) * 100));

    // Animate on mount
    useEffect(() => {
        const duration = 1500;
        const start = Date.now();
        const startValue = 100;
        const endValue = healthPercent;

        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            setAnimatedPercent(startValue + (endValue - startValue) * eased);

            if (progress < 1) requestAnimationFrame(animate);
        };
        animate();
    }, [healthPercent]);

    // Determine color based on health
    let barColor = 'bg-purple-500';
    let glowColor = 'shadow-purple-500/50';
    let textColor = 'text-purple-400';
    let status = 'OPERATIONAL';

    if (animatedPercent < 50) {
        barColor = 'bg-amber-500';
        glowColor = 'shadow-amber-500/50';
        textColor = 'text-amber-400';
        status = 'STRAINED';
    }
    if (animatedPercent < 25) {
        barColor = 'bg-red-500';
        glowColor = 'shadow-red-500/50';
        textColor = 'text-red-500';
        status = 'CRITICAL';
    }

    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 h-full flex flex-col">
            {/* Header */}
            <div className={`text-xs font-bold tracking-widest text-center mb-2 uppercase ${textColor}`}>
                Fund Level
            </div>

            {/* Vertical gauge container */}
            <div className="flex-1 flex items-center justify-center gap-2">
                {/* Vertical bar - centered */}
                <div className="relative w-6 h-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    {/* Fill from bottom */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 ${barColor} shadow-lg ${glowColor} transition-all duration-500 rounded-full`}
                        style={{ height: `${animatedPercent}%` }}
                    />

                    {/* Scale marks */}
                    <div className="absolute inset-0 flex flex-col justify-between py-1">
                        {[100, 75, 50, 25, 0].map((mark) => (
                            <div key={mark} className="flex items-center justify-center">
                                <div className="w-full h-px bg-zinc-700/50" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Labels */}
                <div className="flex flex-col justify-between h-full text-[10px] font-mono text-zinc-600 py-1 text-left">
                    <span>100%</span>
                    <span>75%</span>
                    <span className="text-amber-500">50%</span>
                    <span className="text-red-500">25%</span>
                    <span>0%</span>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-3 text-center">
                <div className={`text-2xl font-black font-mono ${textColor}`}>
                    {Math.round(animatedPercent)}%
                </div>
                <div className="text-xs text-zinc-600 font-mono mt-1">
                    ${currentBalance.toFixed(1)}M / ${initialBalance}M
                </div>
            </div>
        </div>
    );
}
