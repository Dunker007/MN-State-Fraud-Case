"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldAlert, FileText, Printer, Crosshair, Network } from 'lucide-react';
import { type Entity, type Document } from '@/lib/schemas';
import { generateSuspectProfiles, type SuspectProfile } from '@/lib/profiling';
import { findSuspectDocuments } from '@/lib/evidence-linker';

interface SuspectProfilerProps {
    entities: Entity[];
    documents: Document[];
    onVisualizeNetwork?: (ids: string[]) => void;
}

export default function SuspectProfiler({ entities, documents, onVisualizeNetwork }: SuspectProfilerProps) {
    const [selectedProfile, setSelectedProfile] = useState<SuspectProfile | null>(null);
    const [sortMode, setSortMode] = useState<'money' | 'risk'>('money');

    // Memoize the expensive aggregation
    const profiles = useMemo(() => {
        const raw = generateSuspectProfiles(entities);
        if (sortMode === 'risk') {
            return raw.sort((a, b) => b.max_risk_score - a.max_risk_score);
        }
        return raw; // Already sorted by money
    }, [entities, sortMode]);

    const linkedDocs = useMemo(() => {
        if (!selectedProfile) return [];
        return findSuspectDocuments(selectedProfile.name, entities, documents);
    }, [selectedProfile, entities, documents]);

    const topSuspects = profiles.slice(0, 8); // Top 8 Card View

    const handlePrintDossier = () => {
        // Trigger print for the dossier view
        // We'll use a specific print style to format it like an official document
        window.print();
    };

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <Crosshair className="w-6 h-6 text-neon-red animate-[spin_10s_linear_infinite]" />
                    <div>
                        <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
                            TARGET_LIST // KINGPIN_TRACKER
                        </h2>
                        <p className="text-xs text-zinc-500 font-mono">
                            Aggregating shell companies by beneficial owner
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded p-1 flex text-xs font-mono">
                        <button
                            onClick={() => setSortMode('money')}
                            className={`px-3 py-1 rounded transition-colors ${sortMode === 'money' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50' : 'text-zinc-500 hover:text-white'}`}
                        >
                            BY EXPOSURE
                        </button>
                        <button
                            onClick={() => setSortMode('risk')}
                            className={`px-3 py-1 rounded transition-colors ${sortMode === 'risk' ? 'bg-neon-red/20 text-neon-red border border-neon-red/50' : 'text-zinc-500 hover:text-white'}`}
                        >
                            BY RISK
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid of Suspects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {topSuspects.map((profile, i) => (
                    <motion.div
                        key={profile.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedProfile(profile)}
                        className={`
                            relative border rounded-lg p-4 cursor-pointer group overflow-hidden transition-all hover:scale-[1.02]
                            ${selectedProfile?.name === profile.name
                                ? 'bg-red-950/20 border-neon-red ring-1 ring-neon-red'
                                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-600'
                            }
                        `}
                    >
                        {/* Rank Badge */}
                        <div className="absolute top-2 right-2 text-[10px] font-bold text-zinc-600 font-mono">
                            #{i + 1}
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-white truncate pr-6 group-hover:text-neon-blue transition-colors">
                                {profile.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-zinc-500 uppercase">CONTROLS:</span>
                                <span className="text-xs font-mono bg-zinc-800 px-1.5 rounded text-white border border-zinc-700">
                                    {profile.entity_count} ENTITIES
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase mb-0.5">Total Detected Theft</div>
                                <div className="text-lg font-bold text-neon-green font-mono">
                                    ${(profile.total_exposure / 1000000).toFixed(2)}M
                                </div>
                            </div>

                            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                                    style={{ width: `${Math.min(profile.max_risk_score, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-red-900/90 to-transparent group-hover:h-12 transition-all duration-300 flex items-center justify-center">
                            <span className="text-white text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                VIEW FILE
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Detailed Dossier View */}
            <AnimatePresence mode="wait">
                {selectedProfile && (
                    <motion.div
                        key={selectedProfile.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-black border border-zinc-800 rounded-lg overflow-hidden relative"
                    >
                        {/* Rubber Stamp */}
                        <motion.div
                            initial={{ opacity: 0, scale: 3, rotate: -45 }}
                            animate={{ opacity: 1, scale: 1, rotate: -15 }}
                            transition={{ delay: 0.4, type: 'spring', bounce: 0.5, duration: 0.5 }}
                            className="absolute top-8 right-20 md:right-32 z-20 pointer-events-none"
                        >
                            <div className="border-[5px] border-neon-red text-neon-red rounded-lg px-6 py-2 font-black text-3xl md:text-5xl uppercase tracking-[0.2em] -rotate-12 opacity-80 backdrop-blur-sm shadow-[0_0_30px_rgba(255,0,60,0.3)]">
                                TARGETED
                            </div>
                        </motion.div>
                        {/* Dossier Header */}
                        <div className="bg-zinc-900/80 border-b border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
                                    <Users className="text-neon-red" />
                                    {selectedProfile.name}
                                </h3>
                                <p className="text-xs text-zinc-400 font-mono mt-1">
                                    Network Analysis ID: {btoa(selectedProfile.name).substring(0, 12)}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 text-right">
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Empire Value</div>
                                    <div className="text-2xl font-bold text-neon-green font-mono">
                                        ${selectedProfile.total_exposure.toLocaleString()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handlePrintDossier()}
                                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded border border-zinc-600 transition-colors text-xs font-mono"
                                >
                                    <Printer className="w-4 h-4" />
                                    PRINT_INDICTMENT
                                </button>
                                {onVisualizeNetwork && (
                                    <button
                                        onClick={() => onVisualizeNetwork(selectedProfile.entities.map(e => e.id))}
                                        className="flex items-center gap-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue px-4 py-2 rounded border border-neon-blue/50 transition-colors text-xs font-mono"
                                    >
                                        <Network className="w-4 h-4" />
                                        VISUALIZE_EMPIRE
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dossier Body */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">

                            {/* Column 1: Network Stats */}
                            <div className="p-6 space-y-6">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    Risk Assessment
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-red-950/10 border border-red-900/30 p-3 rounded">
                                        <div className="text-[10px] text-red-400 uppercase">Max Deviation</div>
                                        <div className="text-xl font-bold text-neon-red">{selectedProfile.max_risk_score}</div>
                                    </div>
                                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
                                        <div className="text-[10px] text-zinc-500 uppercase">Toxicity Score</div>
                                        <div className="text-xl font-bold text-zinc-300">{selectedProfile.plausible_deniability}%</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase mb-2">Status Distribution</div>
                                    <div className="space-y-1">
                                        {Object.entries(selectedProfile.status_distribution).map(([status, count]) => (
                                            <div key={status} className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-1">
                                                <span className={status.includes('REVOKED') ? 'text-red-400 font-bold' : 'text-zinc-400'}>
                                                    {status}
                                                </span>
                                                <span className="font-mono text-zinc-300">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Linked Evidence Section */}
                                {linkedDocs.length > 0 && (
                                    <div className="pt-6 border-t border-zinc-800">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2 mb-3">
                                            <FileText className="w-4 h-4 text-neon-blue" />
                                            Linked Evidence ({linkedDocs.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {linkedDocs.map(doc => (
                                                <div key={doc.id} className="bg-zinc-900 border border-zinc-800 p-2 rounded hover:border-neon-blue transition-colors group/doc cursor-pointer">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-xs text-zinc-300 font-mono group-hover/doc:text-neon-blue truncate w-3/4">
                                                            {doc.title}
                                                        </p>
                                                        <span className="text-[10px] text-zinc-600 bg-zinc-950 px-1 rounded uppercase">PDF</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Column 2: Controlled Entities */}
                            <div className="p-6 col-span-2">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2 mb-4">
                                    <FileText className="w-4 h-4" />
                                    Controlled Shell Companies ({selectedProfile.entities.length})
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedProfile.entities.map(entity => (
                                        <div key={entity.id} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded hover:border-zinc-600 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-white truncate w-3/4">{entity.name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${entity.risk_score > 50 ? 'bg-red-900/30 text-red-500' : 'bg-green-900/30 text-green-500'
                                                    }`}>
                                                    {entity.risk_score}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-zinc-500 font-mono">
                                                <span>{entity.id}</span>
                                                <span className="text-white">${entity.amount_billed.toLocaleString()}</span>
                                            </div>
                                            {entity.red_flag_reason.length > 0 && (
                                                <div className="mt-2 text-[10px] text-red-400 bg-red-950/10 p-1 rounded border border-red-900/20 truncate">
                                                    ! {entity.red_flag_reason[0]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
