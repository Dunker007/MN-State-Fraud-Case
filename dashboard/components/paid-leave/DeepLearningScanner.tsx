"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const TARGETS = [
    "MN Paid Leave Insolvency",
    "Zip Code 55407",
    "Provider Network Anomalies",
    "Shell Company Registration",
    "DHS Oversight Failure",
    "Cross-State Benefit Claims",
    "IP Address Clusters",
    "Medical Certification Mills"
];

export default function DeepLearningScanner() {
    const [targetIndex, setTargetIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTargetIndex((prev) => (prev + 1) % TARGETS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[60px] bg-black/40 border-y border-purple-900/30 overflow-hidden flex items-center px-4 font-mono select-none">
            {/* Background Grid - scanning effect */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(to right, #7c3aed 1px, transparent 1px), linear-gradient(to bottom, #7c3aed 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Scanning Line */}
            <motion.div
                className="absolute top-0 bottom-0 w-[2px] bg-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.8)] z-10"
                animate={{
                    left: ["0%", "100%"]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Status Text with Glitch Transition */}
            <div className="flex items-center gap-4 z-20 w-full max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Deep Scan Active</span>
                </div>

                <div className="h-6 w-[1px] bg-purple-800/50 mx-2" />

                <div className="flex-1 overflow-hidden relative h-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={targetIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center"
                        >
                            <span className="text-purple-400 text-sm md:text-base font-bold uppercase tracking-wider truncate">
                                Analyzing Vector: <span className="text-white">{TARGETS[targetIndex]}</span>
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-purple-700">
                    <span className="font-mono">NODES: 4,291</span>
                    <span className="font-mono">|</span>
                    <span className="font-mono">LATENCY: 12ms</span>
                </div>
            </div>
        </div>
    );
}
