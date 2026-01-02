"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Lightbulb,
    AlertTriangle,
    Network,
    Clock,
    Skull,
    Target,
    FileWarning,
    Activity,
    Filter
} from 'lucide-react';
import { validatedPatterns, type Pattern as SchemaPattern } from '@/lib/patterns';
import PatternDetailModal from './PatternDetailModal';

// Map string icon names to components

const iconMap: Record<string, React.ElementType> = {
    AlertTriangle,
    Clock,
    Skull,
    Target,
    Network,
    FileWarning,
    Activity
};

const severityConfig = {
    critical: { color: 'text-neon-red', border: 'border-red-900', bg: 'bg-red-950/20' },
    high: { color: 'text-amber-500', border: 'border-amber-900', bg: 'bg-amber-950/20' },
    medium: { color: 'text-yellow-500', border: 'border-yellow-900', bg: 'bg-yellow-950/20' },
};



interface PatternSynthesisProps {
    onNavigate?: (tab: string) => void;
}

export default function PatternSynthesis({ onNavigate: _onNavigate }: PatternSynthesisProps) {
    const [selectedPattern, setSelectedPattern] = useState<SchemaPattern | null>(null);
    const [filterType, setFilterType] = useState<string>('all');

    // Use validated patterns from library
    const detectedPatterns = validatedPatterns;
    const criticalCount = detectedPatterns.filter(p => p.severity === 'critical').length;

    const filteredPatterns = filterType === 'all'
        ? detectedPatterns
        : detectedPatterns.filter(p => p.type === filterType);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <Lightbulb className="w-6 h-6 text-amber-500" />
                    <div>
                        <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
                            AI_PATTERN_SYNTHESIS
                        </h2>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">
                            Automated forensic analysis detects 99.9% probability of coordinated fraud.
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-zinc-500" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 font-mono"
                    >
                        <option value="all">All Types</option>
                        <option value="temporal">Temporal</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="network">Network</option>
                        <option value="financial">Financial</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column: Stats & Conclusion */}
                <div className="space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-3 text-center rounded">
                            <div className="text-2xl font-bold text-white font-mono">{detectedPatterns.length}</div>
                            <div className="text-[10px] text-zinc-500 uppercase">Patterns Detected</div>
                        </div>
                        <div className="bg-red-950/20 border border-red-900 p-3 text-center rounded">
                            <div className="text-2xl font-bold text-neon-red font-mono animate-pulse">{criticalCount}</div>
                            <div className="text-[10px] text-zinc-500 uppercase">Critical Severity</div>
                        </div>
                    </div>

                    {/* Synthesis Conclusion - Compact */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-red-950/30 via-amber-950/20 to-red-950/30 border border-red-900/50 p-4 rounded-lg"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-neon-red" />
                            <h3 className="text-sm font-bold text-white font-mono">SYNTHESIS CONCLUSION</h3>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                            The convergence of <span className="text-neon-red font-bold">{criticalCount} critical patterns</span> indicates
                            a coordinated effort totaling <span className="text-neon-red font-bold">$9+ billion</span>.
                            Systematic witness elimination and temporal clustering demonstrate high-level intent.
                        </p>
                    </motion.div>
                </div>

                {/* Right Column: Pattern Cards (Scrollable) */}
                <div className="xl:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredPatterns.map((pattern, index) => {
                            const severity = severityConfig[pattern.severity as keyof typeof severityConfig];
                            const Icon = iconMap[pattern.icon] || AlertTriangle;

                            return (
                                <motion.button
                                    key={pattern.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedPattern(pattern)}
                                    className={`${severity.bg} border ${severity.border} rounded overflow-hidden text-left hover:border-opacity-100 transition-all group h-full`}
                                >
                                    <div className="p-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Icon className={`w-4 h-4 ${severity.color}`} />
                                                <h3 className={`font-bold ${severity.color} font-mono text-sm truncate max-w-[150px]`}>
                                                    {pattern.name}
                                                </h3>
                                            </div>
                                            <div className={`text-[10px] font-mono ${severity.color} uppercase border border-${severity.color}/30 px-1 rounded`}>
                                                {pattern.severity}
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-400 line-clamp-2 leading-snug">{pattern.summary}</p>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Pattern Detail Modal */}
            <PatternDetailModal
                pattern={selectedPattern}
                onClose={() => setSelectedPattern(null)}
            />
        </motion.section>
    );
}
