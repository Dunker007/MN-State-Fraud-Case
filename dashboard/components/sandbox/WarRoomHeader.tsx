"use client";

import { AlertTriangle, Radio } from 'lucide-react';

export default function WarRoomHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-green-900/30 z-50 flex items-center justify-between px-6 font-mono select-none">
            {/* Left: Branding */}
            <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 animate-pulse rounded-full shadow-[0_0_10px_#22c55e]" />
                <h1 className="text-xl font-bold text-green-500 tracking-widest uppercase">
                    CROSSCHECK<span className="text-green-900">_OS</span> // PAID_LEAVE_NODE
                </h1>
            </div>

            {/* Center: Ticker */}
            <div className="flex-1 mx-8 overflow-hidden relative h-full flex items-center bg-green-950/10 border-x border-green-900/20">
                <div className="animate-marquee whitespace-nowrap text-green-400/70 text-xs">
                    +++ INTERCEPTED: DEED PRESS RELEASE 08:30 CST +++ 15,400 APPLICATIONS RECEIVED +++ FRAUD VECTORS DETECTED IN SECTOR 7 +++ INSOLVENCY VELOCITY INCREASING +++
                </div>
            </div>

            {/* Right: Status */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-green-600">
                    <Radio className="w-4 h-4" />
                    <span>UPLINK_ESTABLISHED</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-900/50 rounded">
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-red-500 font-bold text-xs">DEFCON 2</span>
                </div>
            </div>

            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] z-0 bg-[length:100%_2px,3px_100%] opacity-20" />
        </header>
    );
}
