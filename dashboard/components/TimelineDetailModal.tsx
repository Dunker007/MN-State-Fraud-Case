"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, FileText, Save, Link as LinkIcon, AlertTriangle } from 'lucide-react';

interface TimelineEvent {
    date: string;
    event: string;
    detail: string;
    type?: string;
}

interface TimelineDetailModalProps {
    event: TimelineEvent | null;
    onClose: () => void;
}

export default function TimelineDetailModal({ event, onClose }: TimelineDetailModalProps) {
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (event) {
            const savedNotes = localStorage.getItem(`timeline_notes_${event.date}_${event.event}`);
            setNotes(savedNotes || '');
            setSaved(false);
        }
    }, [event]);

    const handleSave = () => {
        if (event) {
            localStorage.setItem(`timeline_notes_${event.date}_${event.event}`, notes);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    if (!event) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-950/50">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-neon-blue/10 text-neon-blue px-2 py-0.5 rounded text-xs font-mono border border-neon-blue/20">
                                    {event.date}
                                </span>
                                {event.type === 'GAP' && (
                                    <span className="bg-red-950/30 text-red-400 px-2 py-0.5 rounded text-xs font-mono border border-red-900/30 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        ANOMALY
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-white font-mono">{event.event}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Detail Text */}
                        <div className="bg-zinc-950/30 p-4 rounded border border-zinc-800/50">
                            <p className="text-zinc-300 leading-relaxed">
                                {event.detail}
                            </p>
                        </div>

                        {/* Analysis / Notes */}
                        <div>
                            <h3 className="text-sm font-bold text-zinc-500 uppercase flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4" />
                                Investigator Analysis
                            </h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-32 bg-black border border-zinc-800 rounded p-3 text-sm text-white font-mono focus:border-neon-blue focus:outline-none placeholder:text-zinc-700 resize-none"
                                placeholder="Enter forensic notes regarding this timeline event..."
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleSave}
                                    className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-mono transition-all ${saved
                                            ? 'bg-green-900/30 text-green-400 border border-green-800'
                                            : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                                        }`}
                                >
                                    <Save className="w-3 h-3" />
                                    {saved ? 'SAVED_TO_LOCAL' : 'SAVE_NOTES'}
                                </button>
                            </div>
                        </div>

                        {/* Related Context (Mocked for now) */}
                        <div>
                            <h3 className="text-sm font-bold text-zinc-500 uppercase flex items-center gap-2 mb-3">
                                <LinkIcon className="w-4 h-4" />
                                Correlated Evidence
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded flex items-center justify-between group cursor-pointer hover:border-zinc-600 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-400">Related Report</div>
                                            <div className="text-sm text-white font-mono group-hover:text-neon-blue transition-colors">System Logs {event.date}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded flex items-center justify-between group cursor-pointer hover:border-zinc-600 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-400">News Correlation</div>
                                            <div className="text-sm text-white font-mono group-hover:text-neon-blue transition-colors">Search GDELT</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </motion.div>
            </div>
        </AnimatePresence>
    );
}
