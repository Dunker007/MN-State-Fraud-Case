
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, Check, X, Skull, AlertCircle } from 'lucide-react';
import { MasterlistEntity } from '@/lib/types';

interface PenaltyBoxTriageProps {
    candidates: MasterlistEntity[];
}

export default function PenaltyBoxTriage({ candidates }: PenaltyBoxTriageProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [decisions, setDecisions] = useState<{ id: string, action: 'KEEP' | 'REJECT' }[]>([]);

    const currentEntity = candidates[currentIndex];

    const handleDecision = (action: 'KEEP' | 'REJECT') => {
        if (!currentEntity) return;
        setDecisions(prev => [...prev, { id: currentEntity.license_id, action }]);
        setCurrentIndex(prev => prev + 1);
    };

    if (currentIndex >= candidates.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-xl text-center">
                <Check className="w-16 h-16 text-emerald-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">TRIAGE COMPLETE</h3>
                <p className="text-zinc-500 mb-6">All candidates have been reviewed. Decisions recorded: {decisions.length}</p>
                <button
                    onClick={() => { setCurrentIndex(0); setDecisions([]); }}
                    className="px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors"
                >
                    RESET TRIAGE
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-xl mx-auto">
            <div className="absolute -top-12 left-0 right-0 flex justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-widest px-2">
                <span>Entity {currentIndex + 1} / {candidates.length}</span>
                <span>Decision Queue</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentEntity.license_id}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.1, opacity: 0, x: decisions[decisions.length - 1]?.action === 'REJECT' ? -200 : 200 }}
                    className="bg-zinc-900 border-4 border-red-900/30 rounded-2xl overflow-hidden shadow-2xl relative"
                >
                    {/* Header/Banner */}
                    <div className="h-4 bg-red-600" />

                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-3xl font-black italic text-white leading-tight uppercase tracking-tighter">
                                    {currentEntity.name}
                                </h3>
                                <p className="text-red-500 font-mono text-xs mt-1">LIC#{currentEntity.license_id}</p>
                            </div>
                            <Skull className="w-8 h-8 text-red-900 opacity-50" />
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-black/40 p-4 rounded border border-white/5">
                                <span className="text-[10px] text-zinc-500 block uppercase mb-1">Current Status</span>
                                <span className="text-red-400 font-bold">{currentEntity.status}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-zinc-500 block uppercase mb-1">Location</span>
                                    <span className="text-zinc-300">{currentEntity.city}, MN</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-500 block uppercase mb-1">Owner</span>
                                    <span className="text-zinc-300 truncate block">{currentEntity.owner || 'UNKNOWN'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4 mt-12">
                            <button
                                onClick={() => handleDecision('REJECT')}
                                className="flex-1 flex flex-col items-center gap-2 py-4 bg-zinc-950 border-2 border-red-900/50 hover:bg-red-950 transition-all rounded-xl group"
                            >
                                <X className="w-8 h-8 text-red-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black tracking-widest text-red-900 uppercase">REJECT</span>
                            </button>

                            <button
                                onClick={() => handleDecision('KEEP')}
                                className="flex-1 flex flex-col items-center gap-2 py-4 bg-zinc-950 border-2 border-emerald-900/50 hover:bg-emerald-950 transition-all rounded-xl group"
                            >
                                <Check className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black tracking-widest text-emerald-900 uppercase">KEEP</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="bg-red-600/10 p-3 flex items-center gap-3 border-t border-red-900/20">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-[10px] font-mono text-red-400 leading-none">WARNING: Decision affects live enforcement priority.</span>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Visual Cues */}
            <div className="mt-8 flex justify-center gap-12 text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em]">
                <span>← Swipe Left to Reject</span>
                <span>Swipe Right to Keep →</span>
            </div>
        </div>
    );
}
