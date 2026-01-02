
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Calendar, FileText, AlertTriangle, Link as LinkIcon, Save } from 'lucide-react';
import type { DossierEntry } from '@/lib/dossiers';

interface EmployeeDossierModalProps {
    dossier: DossierEntry | null;
    onClose: () => void;
}

export default function EmployeeDossierModal({ dossier, onClose }: EmployeeDossierModalProps) {
    const [notes, setNotes] = useState('');
    const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});

    // Load saved notes from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('dossier_notes');
        if (stored) {
            setSavedNotes(JSON.parse(stored));
        }
    }, []);

    // Load notes for current dossier
    useEffect(() => {
        if (dossier) {
            setNotes(savedNotes[dossier.name] || '');
        }
    }, [dossier, savedNotes]);

    const handleSaveNotes = () => {
        if (!dossier) return;

        const updated = { ...savedNotes, [dossier.name]: notes };
        setSavedNotes(updated);
        localStorage.setItem('dossier_notes', JSON.stringify(updated));

        // Visual feedback
        const btn = document.getElementById('save-notes-btn');
        if (btn) {
            btn.classList.add('bg-green-600');
            setTimeout(() => btn.classList.remove('bg-green-600'), 1000);
        }
    };

    if (!dossier) return null;

    const statusColors = {
        TARGET: 'text-red-500 bg-red-950/50 border-red-500',
        BURIED: 'text-zinc-400 bg-zinc-950 border-zinc-500',
        POI: 'text-amber-500 bg-amber-950/50 border-amber-500',
        PROTECTED: 'text-blue-500 bg-blue-950/50 border-blue-500',
        WITNESS: 'text-purple-500 bg-purple-950/50 border-purple-500',
        CLEAN: 'text-emerald-500 bg-emerald-950/20 border-emerald-800/50',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg border ${statusColors[dossier.investigationStatus]}`}>
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white font-mono">{dossier.name}</h2>
                                <p className="text-zinc-400 text-sm mt-1">{dossier.role}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-mono border ${statusColors[dossier.investigationStatus]}`}>
                                        {dossier.investigationStatus}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300">
                                        Priority: {dossier.priorityScore}/100
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Intelligence Report */}
                        <div className="bg-black/30 border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Intelligence Report</h3>
                            </div>
                            <div className="text-sm text-zinc-300 space-y-2">
                                {dossier.intelNotes.map((note, i) => (
                                    <p key={i} className="leading-relaxed">{note}</p>
                                ))}
                            </div>
                        </div>

                        {/* Key Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/30 border border-zinc-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase">Department</h4>
                                </div>
                                <p className="text-sm text-white font-mono">MN DHS</p>
                            </div>
                            <div className="bg-black/30 border border-zinc-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-purple-500" />
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase">Last Updated</h4>
                                </div>
                                <p className="text-sm text-white font-mono">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Related Connections */}
                        {dossier.investigationStatus !== 'CLEAN' && (
                            <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <LinkIcon className="w-4 h-4 text-red-500" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Known Connections</h3>
                                </div>
                                <div className="space-y-2 text-sm text-zinc-300">
                                    <p className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        <span>Access to provider licensing database</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        <span>Payment approval authority</span>
                                    </p>
                                    {dossier.investigationStatus === 'TARGET' && (
                                        <p className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                            <span className="font-bold text-red-400">Under active investigation</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Investigator Notes */}
                        <div className="bg-black/30 border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-blue-500" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Investigator Notes</h3>
                                </div>
                                <button
                                    id="save-notes-btn"
                                    onClick={handleSaveNotes}
                                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                >
                                    <Save className="w-3 h-3" />
                                    Save
                                </button>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add investigation notes, observations, leads to follow..."
                                className="w-full bg-black/50 border border-zinc-700 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 min-h-[150px] font-mono"
                            />
                            <p className="text-xs text-zinc-500 mt-2">Notes are saved locally and persist across sessions.</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <p className="text-xs text-zinc-500 font-mono">
                            DOSSIER_ID: {btoa(dossier.name).substring(0, 12)}
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
