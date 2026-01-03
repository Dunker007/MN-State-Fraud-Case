"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface InsolvencyCountdownProps {
    launchDate?: Date;
    projectedInsolvencyDate?: Date;
    currentBurnRate?: number; // millions per month
}

export default function InsolvencyCountdown({
    launchDate = new Date('2026-01-01'),
    projectedInsolvencyDate = new Date('2027-06-15'),
    currentBurnRate = 85
}: InsolvencyCountdownProps) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeSinceLaunch = now.getTime() - launchDate.getTime();
    const daysSinceLaunch = Math.max(0, Math.floor(timeSinceLaunch / (1000 * 60 * 60 * 24)));

    const timeToInsolvency = projectedInsolvencyDate.getTime() - now.getTime();
    const daysToInsolvency = Math.max(0, Math.floor(timeToInsolvency / (1000 * 60 * 60 * 24)));
    const hoursToInsolvency = Math.max(0, Math.floor((timeToInsolvency % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const minutesToInsolvency = Math.max(0, Math.floor((timeToInsolvency % (1000 * 60 * 60)) / (1000 * 60)));
    const secondsToInsolvency = Math.max(0, Math.floor((timeToInsolvency % (1000 * 60)) / 1000));

    const estimatedBurned = daysSinceLaunch * (currentBurnRate / 30); // Daily burn

    const isLaunched = now >= launchDate;
    const isInsolvent = now >= projectedInsolvencyDate;

    return (
        <div className="bg-gradient-to-br from-amber-950/30 via-black to-red-950/30 border border-amber-500/30 rounded-xl p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">INSOLVENCY COUNTDOWN</h2>
                    <p className="text-xs text-amber-500/70 font-mono">MN PAID LEAVE PROGRAM</p>
                </div>
            </div>

            {!isLaunched ? (
                /* Pre-Launch State */
                <div className="text-center py-8">
                    <p className="text-zinc-400 mb-2">Program Launch In:</p>
                    <div className="text-4xl font-bold text-amber-500 font-mono">
                        {Math.ceil((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} DAYS
                    </div>
                    <p className="text-xs text-zinc-600 mt-2 font-mono">
                        January 1, 2026
                    </p>
                </div>
            ) : isInsolvent ? (
                /* Post-Insolvency State */
                <div className="text-center py-8">
                    <div className="text-5xl font-black text-red-500 mb-2">INSOLVENT</div>
                    <p className="text-zinc-400">The program has exceeded projected funding.</p>
                </div>
            ) : (
                /* Active Countdown */
                <>
                    {/* Days Since Launch */}
                    <div className="flex items-center justify-between mb-6 p-3 bg-black/50 rounded-lg border border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            <span className="text-sm text-zinc-400">Days Active</span>
                        </div>
                        <span className="text-xl font-bold text-white font-mono">{daysSinceLaunch}</span>
                    </div>

                    {/* Countdown Display */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <div className="text-center p-3 bg-red-950/50 rounded-lg border border-red-900/50">
                            <div className="text-3xl font-bold text-red-400 font-mono">{daysToInsolvency}</div>
                            <div className="text-[10px] text-red-500/70 uppercase">Days</div>
                        </div>
                        <div className="text-center p-3 bg-red-950/30 rounded-lg border border-red-900/30">
                            <div className="text-3xl font-bold text-red-400/80 font-mono">{hoursToInsolvency.toString().padStart(2, '0')}</div>
                            <div className="text-[10px] text-red-500/50 uppercase">Hours</div>
                        </div>
                        <div className="text-center p-3 bg-red-950/20 rounded-lg border border-red-900/20">
                            <div className="text-3xl font-bold text-red-400/60 font-mono">{minutesToInsolvency.toString().padStart(2, '0')}</div>
                            <div className="text-[10px] text-red-500/40 uppercase">Mins</div>
                        </div>
                        <div className="text-center p-3 bg-red-950/10 rounded-lg border border-red-900/10">
                            <div className="text-3xl font-bold text-red-400/40 font-mono animate-pulse">{secondsToInsolvency.toString().padStart(2, '0')}</div>
                            <div className="text-[10px] text-red-500/30 uppercase">Secs</div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/50 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingDown className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-zinc-500">Burn Rate</span>
                            </div>
                            <div className="text-lg font-bold text-amber-400 font-mono">
                                ${currentBurnRate}M<span className="text-xs text-zinc-600">/mo</span>
                            </div>
                        </div>
                        <div className="p-3 bg-black/50 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-red-500" />
                                <span className="text-xs text-zinc-500">Est. Burned</span>
                            </div>
                            <div className="text-lg font-bold text-red-400 font-mono">
                                ${estimatedBurned.toFixed(1)}M
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 font-mono">
                    PROJECTION BASED ON CURRENT ACTUARIAL DATA • REAL-TIME TRACKING
                </p>
            </div>
        </div>
    );
}
