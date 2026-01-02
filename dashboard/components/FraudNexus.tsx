"use client";

import { motion } from 'framer-motion';
import { ShieldAlert, TrendingDown, Target, AlertTriangle } from 'lucide-react';

export default function FraudNexus() {
    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-950/10 border border-red-900/50 rounded-lg p-6 relative overflow-hidden flex flex-col justify-between h-full min-h-[350px]"
        >
            {/* Background scanner effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            <motion.div
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[1px] bg-red-500/50 blur-[2px] pointer-events-none"
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-900/50 pb-4 mb-4 z-10">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
                    <div>
                        <h2 className="text-2xl font-black text-white font-mono tracking-wider">BREACHED</h2>
                        <p className="text-xs text-red-400 font-mono tracking-widest">SYSTEM INTEGRITY CRITICAL</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-red-500/20 border border-red-500 text-red-500 text-xs font-bold rounded animate-pulse">
                    ACTIVE THREAT
                </div>
            </div>

            {/* Core Stats Content */}
            <div className="space-y-8 z-10 flex-1 flex flex-col justify-center">

                {/* Source */}
                <div>
                    <div className="text-red-400 text-sm font-mono mb-1 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        SOURCE OF FUNDS
                    </div>
                    <div className="text-4xl font-black text-white tracking-tight">MN DHS</div>
                    <div className="text-sm text-zinc-500 font-mono mt-1">DEPARTMENT OF HUMAN SERVICES</div>
                </div>

                {/* Amount */}
                <div className="border-l-4 border-red-600 pl-6 py-2 bg-gradient-to-r from-red-950/30 to-transparent">
                    <div className="text-red-400 text-sm font-mono mb-1">ESTIMATED DIVERSION</div>
                    <div className="text-6xl font-black text-red-500 tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                        $9 BILLION
                    </div>
                    <div className="text-xs text-red-300/50 font-mono mt-1 w-full text-right pr-4">FY 2020-2025</div>
                </div>

                {/* Destination */}
                <div>
                    <div className="text-amber-500 text-sm font-mono mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        TERROR NEXUS CONFIRMED
                    </div>
                    <div className="bg-black/40 border border-amber-900/50 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">HORN OF AFRICA</div>
                                <div className="text-sm text-amber-500 font-mono">DESTINATION: SOMALIA / KENYA</div>
                            </div>
                            <Target className="w-8 h-8 text-amber-600" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                                <span>LINKED GROUP:</span>
                                <span className="text-red-400 font-bold">AL-SHABAAB</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-mono bg-red-950/20 p-2 rounded border border-red-900/30">
                                <span className="text-red-400">EST. OVERSEAS TRANSFER (12%):</span>
                                <span className="text-white font-bold">$1.08 BILLION</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </motion.section>
    );
}
