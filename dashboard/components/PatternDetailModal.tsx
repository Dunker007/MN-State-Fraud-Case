"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, FileText, Target, Download, Save, CheckCircle2 } from 'lucide-react';
import type { Pattern } from '@/lib/patterns';

interface PatternDetailModalProps {
    pattern: Pattern | null;
    onClose: () => void;
}

export default function PatternDetailModal({ pattern, onClose }: PatternDetailModalProps) {
    const [notes, setNotes] = useState('');
    const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});
    const [showExported, setShowExported] = useState(false);

    // Load saved notes from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('pattern_notes');
        if (stored) {
            setSavedNotes(JSON.parse(stored));
        }
    }, []);

    // Load notes for current pattern
    useEffect(() => {
        if (pattern) {
            setNotes(savedNotes[pattern.id] || '');
        }
    }, [pattern, savedNotes]);

    const handleSaveNotes = () => {
        if (!pattern) return;

        const updated = { ...savedNotes, [pattern.id]: notes };
        setSavedNotes(updated);
        localStorage.setItem('pattern_notes', JSON.stringify(updated));

        // Visual feedback
        const btn = document.getElementById('save-pattern-notes-btn');
        if (btn) {
            btn.classList.add('bg-green-600');
            setTimeout(() => btn.classList.remove('bg-green-600'), 1000);
        }
    };

    const handleExport = () => {
        if (!pattern) return;

        const exportData = {
            pattern: pattern.name,
            id: pattern.id,
            severity: pattern.severity,
            type: pattern.type,
            probability: pattern.probability,
            summary: pattern.summary,
            evidence: pattern.evidence,
            deepDive: pattern.deepDive,
            investigatorNotes: notes,
            exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pattern_${pattern.id}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        setShowExported(true);
        setTimeout(() => setShowExported(false), 2000);
    };

    if (!pattern) return null;

    const severityColors = {
        critical: { bg: 'bg-red-950/50', border: 'border-red-500', text: 'text-red-500' },
        high: { bg: 'bg-amber-950/50', border: 'border-amber-500', text: 'text-amber-500' },
        medium: { bg: 'bg-yellow-950/50', border: 'border-yellow-500', text: 'text-yellow-500' },
    };

    const colors = severityColors[pattern.severity as keyof typeof severityColors] || severityColors.medium;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`bg-zinc-900 border rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col ${colors.border}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={`p-6 border-b ${colors.border} ${colors.bg}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className={`w-6 h-6 ${colors.text}`} />
                                    <h2 className={`text-2xl font-bold ${colors.text} font-mono`}>
                                        {pattern.name}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-mono border ${colors.border} ${colors.bg} ${colors.text} uppercase`}>
                                        {pattern.severity}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300 uppercase">
                                        {pattern.type}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-950/50 border border-purple-500 text-purple-300">
                                        {pattern.probability}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Summary */}
                        <div className="bg-black/30 border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Pattern Summary</h3>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed">
                                {pattern.summary}
                            </p>
                        </div>

                        {/* Evidence List */}
                        <div className={`border rounded-lg p-4 ${colors.border} ${colors.bg}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Target className={`w-4 h-4 ${colors.text}`} />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                                        Evidence Points ({pattern.evidence.length})
                                    </h3>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {pattern.evidence.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-3 bg-black/40 p-3 rounded border border-zinc-800"
                                    >
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                                            <span className={`text-xs font-mono ${colors.text}`}>{i + 1}</span>
                                        </div>
                                        <p className="text-sm text-zinc-300 flex-1 leading-relaxed">{item}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Deep Dive Section */}
                        {pattern.deepDive && (
                            <div className="bg-gradient-to-br from-blue-950/20 to-purple-950/20 border border-blue-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Deep Dive Analysis</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-black/40 border border-zinc-800 rounded p-3">
                                        <div className="text-xs text-zinc-500 uppercase mb-1">Methodology</div>
                                        <div className="text-sm text-zinc-300">{pattern.deepDive.methodology}</div>
                                    </div>
                                    <div className="bg-black/40 border border-zinc-800 rounded p-3">
                                        <div className="text-xs text-zinc-500 uppercase mb-1">Data Points Analyzed</div>
                                        <div className="text-2xl font-bold text-white font-mono">
                                            {pattern.deepDive.dataPoints.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {pattern.deepDive.relatedEntities && pattern.deepDive.relatedEntities.length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-xs text-zinc-500 uppercase mb-2">Related Entities</div>
                                        <div className="flex flex-wrap gap-2">
                                            {pattern.deepDive.relatedEntities.map((entity, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-black/40 border border-zinc-700 rounded-full text-xs text-zinc-300 font-mono hover:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    {entity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {pattern.deepDive.recommendations && pattern.deepDive.recommendations.length > 0 && (
                                    <div>
                                        <div className="text-xs text-zinc-500 uppercase mb-2">Recommendations</div>
                                        <div className="space-y-2">
                                            {pattern.deepDive.recommendations.map((rec, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>{rec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Investigator Notes */}
                        <div className="bg-black/30 border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-500" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Investigator Notes</h3>
                                </div>
                                <button
                                    id="save-pattern-notes-btn"
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
                                placeholder="Add investigation notes, cross-references, leads to follow..."
                                className="w-full bg-black/50 border border-zinc-700 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 min-h-[120px] font-mono"
                            />
                            <p className="text-xs text-zinc-500 mt-2">Notes are saved locally and persist across sessions.</p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <div className="text-xs text-zinc-500 font-mono">
                            PATTERN_ID: {pattern.id} | CONFIDENCE: {pattern.probability}
                        </div>
                        <div className="flex items-center gap-3">
                            {showExported && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs text-green-400 font-mono"
                                >
                                    ✓ Exported
                                </motion.span>
                            )}
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Analysis
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
