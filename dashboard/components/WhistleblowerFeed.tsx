
"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Lock, Terminal, Eye } from 'lucide-react';

interface report {
    id: string;
    timestamp: string;
    location: string;
    payload: string;
    status: 'ENCRYPTED' | 'DECRYPTED' | 'VERIFIED';
}

const MOCK_REPORTS: report[] = [
    { id: 'WB-992', timestamp: '14:02:11', location: 'St. Paul, MN', payload: 'DHS Internal Memo: 480 alerts suppressed by IG Office.', status: 'VERIFIED' },
    { id: 'WB-810', timestamp: '13:45:22', location: 'Minneapolis, MN', payload: 'Feeding Our Future: Multi-million diversion via shell vendors.', status: 'DECRYPTED' },
    { id: 'WB-773', timestamp: '13:12:05', location: 'Unknown Proxy', payload: 'Executive Override initiated for licensing approval 24-09.', status: 'ENCRYPTED' },
    { id: 'WB-661', timestamp: '12:55:10', location: 'Eagan, MN', payload: 'Ghost office detected: 720 Summit ST is residential.', status: 'VERIFIED' },
];

export default function WhistleblowerFeed() {
    const [reports, setReports] = useState<report[]>(MOCK_REPORTS);
    const [activeindex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % reports.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [reports.length]);

    return (
        <div className="bg-black/80 border-2 border-red-900/50 rounded-lg p-4 font-mono overflow-hidden relative min-h-[140px]">
            {/* Background scanline effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <div className="flex items-center justify-between mb-4 border-b border-red-900/30 pb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                    <h3 className="text-xs font-black tracking-widest text-red-500 uppercase">Live: 480 Whistleblowers</h3>
                </div>
                <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    Secure Channel 00-X
                </div>
            </div>

            <div className="relative h-[80px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={reports[activeindex].id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute inset-0"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] text-zinc-400">ID: {reports[activeindex].id}</span>
                            <span className="text-[10px] text-red-700 bg-red-950/30 px-1 rounded">{reports[activeindex].status}</span>
                        </div>
                        <p className="text-xs text-red-200 leading-relaxed max-w-full">
                            <span className="text-red-900 mr-2">[{reports[activeindex].timestamp}]</span>
                            {reports[activeindex].payload}
                        </p>
                        <div className="mt-2 text-[9px] text-zinc-600 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Sourced from: {reports[activeindex].location}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute bottom-2 right-2 opacity-20 hover:opacity-100 transition-opacity">
                <Lock className="w-4 h-4 text-red-900" />
            </div>
        </div>
    );
}
