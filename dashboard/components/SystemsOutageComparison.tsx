"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Wifi, WifiOff, RefreshCcw, Lock } from "lucide-react";
import outageData from "@/lib/outage_analysis.json";

export default function SystemsOutageComparison() {
    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 lg:p-12 overflow-hidden relative">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
                    The "Maintenance" Alibi
                </h2>
                <p className="text-zinc-400 max-w-2xl mx-auto font-mono text-sm leading-relaxed">
                    On the exact day massive revocation orders were processed, the public lookup tool went offline for "scheduled maintenance," effectively hiding the mass status changes from parents and journalists.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* LEFT: BEFORE (NOV 29) */}
                <div className="relative group">
                    <div className="absolute -inset-2 bg-green-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <BrowserWindow
                        date={outageData.baseline_date}
                        status="ONLINE"
                        color="green"
                    >
                        <div className="space-y-2 opacity-50 pointer-events-none grayscale-[0.5]">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-8 bg-zinc-200 rounded w-full animate-pulse" />
                            ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white/90 p-4 shadow-xl border border-zinc-200 rounded text-center">
                                <div className="text-sm font-bold text-zinc-800">PRESTIGE HEALTH</div>
                                <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded inline-block mt-1">ACTIVE</div>
                            </div>
                        </div>
                    </BrowserWindow>
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-green-950/30 text-green-500 px-3 py-1 rounded-full text-xs font-mono border border-green-900/50">
                            <Wifi className="w-3 h-3" /> SYSTEM OPERATIONAL
                        </div>
                    </div>
                </div>

                {/* ARROW */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black rounded-full p-2 border border-zinc-700">
                    <RefreshCcw className="w-6 h-6 text-zinc-500" />
                </div>

                {/* RIGHT: AFTER (DEC 30) */}
                <div className="relative group">
                    <div className="absolute -inset-2 bg-red-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <BrowserWindow
                        date={outageData.event_date}
                        status="MAINTENANCE"
                        color="red"
                    >
                        {/* THE BANNER */}
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center p-6">
                            <div className="bg-red-50 border-l-4 border-red-500 p-6 shadow-2xl max-w-sm w-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <AlertTriangle className="w-12 h-12 text-red-500" />
                                </div>
                                <div className="font-bold text-red-700 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> SYSTEM NOTICE
                                </div>
                                <p className="text-sm text-red-900 font-medium leading-relaxed">
                                    {outageData.banner_text}
                                </p>
                                <div className="mt-4 text-[10px] text-red-400 font-mono uppercase tracking-widest">
                                    Error Code: 503_SERVICE_UNAVAILABLE
                                </div>
                            </div>
                        </div>

                        {/* Hidden Content Behind */}
                        <div className="space-y-2 opacity-20 pointer-events-none">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-8 bg-zinc-800 rounded w-full" />
                            ))}
                        </div>
                    </BrowserWindow>
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-red-950/30 text-red-500 px-3 py-1 rounded-full text-xs font-mono border border-red-900/50 animate-pulse">
                            <WifiOff className="w-3 h-3" /> RESTRICTED ACCESS
                        </div>
                    </div>
                </div>
            </div>

            {/* Evidence Check */}
            <div className="mt-12 bg-black/40 border border-zinc-800 rounded p-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4">Correlation Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1">
                        <div className="text-xs text-zinc-500">EVENT DATE</div>
                        <div className="font-mono text-white text-lg">Dec 30, 2024</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-xs text-zinc-500">ACTION TAKEN</div>
                        <div className="font-mono text-neon-red text-lg">Mass Revocations</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-xs text-zinc-500">PUBLIC STATUS</div>
                        <div className="font-mono text-amber-500 text-lg">Platform Offline</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function BrowserWindow({ date, status, color, children }: { date: string, status: string, color: string, children: React.ReactNode }) {
    return (
        <div className="bg-zinc-100 rounded-lg overflow-hidden shadow-2xl border border-zinc-500 h-[300px] flex flex-col relative">
            {/* Browser Bar */}
            <div className="bg-zinc-200 border-b border-zinc-300 p-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white h-6 rounded flex items-center px-2 text-[10px] text-zinc-400 font-mono shadow-inner">
                    <Lock className="w-2.5 h-2.5 mr-1" />
                    mndhs.state.mn.us/lookup
                </div>
            </div>
            {/* Content area */}
            <div className="flex-1 p-4 bg-white relative">
                {children}
            </div>
            {/* Date Stamp */}
            <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-[10px] font-bold font-mono border ${color === 'green' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                {date}
            </div>
        </div>
    );
}
