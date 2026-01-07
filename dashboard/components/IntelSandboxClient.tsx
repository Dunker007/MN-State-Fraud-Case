'use client';

import { useState, Suspense } from 'react';
import ForensicTimeMachine from '@/components/ForensicTimeMachine';
import ExcuseTracker from '@/components/ExcuseTracker';
import ScandalNewsFeed from '@/components/ScandalNewsFeed';
import HunterPhaseIndicator from '@/components/HunterPhaseIndicator';

export default function IntelSandboxClient() {
    const [activeDate, setActiveDate] = useState<string>('');

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-mono">

            {/* Professional Header */}
            <div className="max-w-[1600px] mx-auto border-b border-zinc-800 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">
                        <span className="text-white">INTEL</span><span className="text-zinc-600">.</span><span className="text-zinc-500">OPS</span>
                    </h1>
                    <p className="text-zinc-500 text-sm tracking-widest uppercase border-l-2 border-purple-500 pl-4">
                        Signal Correlation & Timeline Analysis
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded uppercase tracking-widest">
                        v2.1 Stable
                    </span>
                </div>
            </div>

            {/* Main Operational Grid */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Control Column */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-8">

                    {/* Time Machine Module */}
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                        <div className="bg-black/50 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Temporal Index</span>
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                        </div>
                        <div className="p-6">
                            <ForensicTimeMachine onDateChange={setActiveDate} />
                        </div>
                    </div>

                    {/* Excuse Tracker Module */}
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                        <div className="bg-black/50 px-6 py-4 border-b border-zinc-800">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Mechanism Monitor</span>
                        </div>
                        <div className="p-6">
                            <ExcuseTracker />
                        </div>
                    </div>
                </div>

                {/* Right Data Column */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden h-full min-h-[800px] relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-20"></div>

                        <div className="p-0 h-full">
                            <Suspense fallback={<div className="p-12 text-center text-zinc-600 font-mono tracking-widest animate-pulse">ESTABLISHING UPLINK...</div>}>
                                <ScandalNewsFeed activeDate={activeDate} />
                            </Suspense>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
