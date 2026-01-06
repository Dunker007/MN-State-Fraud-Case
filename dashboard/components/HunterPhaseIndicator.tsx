'use client';

import { useEffect, useState } from 'react';
import { Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HunterPhase {
    id: number;
    name: string;
    keywords: string[];
    color: string;
    description: string;
}

const HUNTER_PHASES: HunterPhase[] = [
    {
        id: 1,
        name: 'Minnesota Ground Truth',
        keywords: ['Minnesota fraud', 'MN DHS', 'Feeding Our Future', 'Twin Cities'],
        color: '#3b82f6', // blue
        description: 'Minnesota-specific fraud patterns',
    },
    {
        id: 2,
        name: 'Federal Nexus',
        keywords: ['federal fraud', 'DOJ investigation', 'FBI', 'inspector general'],
        color: '#8b5cf6', // purple
        description: 'Federal investigation angles',
    },
    {
        id: 3,
        name: 'Network Forensics',
        keywords: ['shell companies', 'money laundering', 'network analysis', 'Phoenix entities'],
        color: '#ec4899', // pink
        description: 'Entity network mapping',
    },
    {
        id: 4,
        name: 'Legislative Response',
        keywords: ['Minnesota legislature', 'policy reform', 'oversight', 'accountability'],
        color: '#f59e0b', // amber
        description: 'Policy and legislative action',
    },
];

const CYCLE_DURATION_MS = 15 * 60 * 1000; // 15 minutes per phase

export default function HunterPhaseIndicator({ variant = 'badge' }: { variant?: 'badge' | 'detailed' }) {
    const [currentPhase, setCurrentPhase] = useState<HunterPhase>(HUNTER_PHASES[0]);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    useEffect(() => {
        // Calculate current phase based on time
        const updatePhase = () => {
            const now = Date.now();
            const cycleStart = Math.floor(now / CYCLE_DURATION_MS) * CYCLE_DURATION_MS;
            const elapsed = now - cycleStart;
            const phaseIndex = Math.floor((elapsed / CYCLE_DURATION_MS) * HUNTER_PHASES.length) % HUNTER_PHASES.length;
            const nextPhaseTime = cycleStart + ((phaseIndex + 1) * CYCLE_DURATION_MS / HUNTER_PHASES.length);

            setCurrentPhase(HUNTER_PHASES[phaseIndex]);
            setTimeRemaining(Math.floor((nextPhaseTime - now) / 1000));
        };

        updatePhase();
        const interval = setInterval(updatePhase, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (variant === 'badge') {
        return (
            <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors"
                style={{
                    backgroundColor: `${currentPhase.color}20`,
                    borderColor: `${currentPhase.color}60`,
                    color: currentPhase.color,
                }}
            >
                <Zap className="w-3 h-3 animate-pulse" />
                <span className="font-bold">HUNTER: {currentPhase.name}</span>
                <span className="opacity-60">•</span>
                <span className="opacity-80 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(timeRemaining)}
                </span>
            </div>
        );
    }

    return (
        <div
            className="bg-zinc-900/50 border rounded-xl p-4 transition-colors"
            style={{ borderColor: `${currentPhase.color}40` }}
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap
                            className="w-4 h-4 animate-pulse"
                            style={{ color: currentPhase.color }}
                        />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                            Hunter Protocol
                        </h3>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono">
                        Rotating GDELT query strategy • 15min cycles
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono" style={{ color: currentPhase.color }}>
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(timeRemaining)}</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPhase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                >
                    <div
                        className="px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide"
                        style={{
                            backgroundColor: `${currentPhase.color}20`,
                            color: currentPhase.color,
                        }}
                    >
                        Phase {currentPhase.id}: {currentPhase.name}
                    </div>

                    <p className="text-xs text-zinc-400">
                        {currentPhase.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {currentPhase.keywords.map((keyword, idx) => (
                            <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider"
                                style={{
                                    backgroundColor: `${currentPhase.color}15`,
                                    color: currentPhase.color,
                                    border: `1px solid ${currentPhase.color}30`,
                                }}
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-3">
                        <motion.div
                            className="h-full"
                            style={{ backgroundColor: currentPhase.color }}
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: CYCLE_DURATION_MS / HUNTER_PHASES.length / 1000, ease: 'linear' }}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
