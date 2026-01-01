"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Network, Share2, FileWarning, Search, Skull, Unlock, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import RedactedText from "./RedactedText";

import { type Entity } from "@/lib/schemas";

// Removed local Entity interface to use shared Zod schema type


interface ForensicDossierProps {
    entity: Entity;
    onClose: () => void;
    allEntities: Entity[]; // Need full list to look up network peers
}

export default function ForensicDossier({ entity, onClose, allEntities }: ForensicDossierProps) {
    const [declassified, setDeclassified] = useState(false);
    const isHighRisk = entity.risk_score > 50;

    // Resolve Network Peers
    const networkPeers = entity.network_ids
        ? allEntities.filter(e => entity.network_ids?.includes(e.id) && e.id !== entity.id)
        : [];

    // Check for Phoenix Parent
    // We parse the red flag string to find the name if possible, or just look for matching stems in the peers
    // "PHOENIX_PROTOCOL: Rebranding Detected (Linked to Revoked Entity 'ZION...')"
    const phoenixFlag = entity.red_flag_reason.find(f => f.includes("PHOENIX_PROTOCOL"));
    let phoenixPredecessors: Entity[] = [];
    if (phoenixFlag) {
        // Find peers with Revoked status
        phoenixPredecessors = networkPeers.filter(p => p.status.includes("REVOKED") || p.status.includes("DENIED"));
        // Also check global list if network link failed but name match worked
        if (phoenixPredecessors.length === 0) {
            const stem = entity.name.split(' ')[0].toUpperCase();
            if (stem.length > 3) {
                phoenixPredecessors = allEntities.filter(e => e.name.toUpperCase().startsWith(stem) && (e.status.includes("REVOKED") || e.status.includes("DENIED")));
            }
        }
    }

    return (
        <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-black/95 border-l border-neon-red/50 z-50 shadow-2xl shadow-red-900/50 backdrop-blur-sm overflow-y-auto"
        >
            {/* Header */}
            <div className="bg-red-950/20 px-6 py-4 border-b border-red-900/30 flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-neon-red animate-pulse" />
                    <div>
                        <h2 className="text-white font-mono font-bold text-lg tracking-tight">TARGET_DOSSIER</h2>
                        <p className="text-xs text-red-400 font-mono">{entity.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Declassify Toggle */}
                    <button
                        onClick={() => setDeclassified(!declassified)}
                        className={`text-[10px] font-mono px-2 py-1 border transition-all flex items-center gap-1 ${declassified
                            ? 'border-green-600 text-green-400 bg-green-950/30'
                            : 'border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500'
                            }`}
                    >
                        {declassified ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {declassified ? 'DECLASSIFIED' : 'DECLASSIFY'}
                    </button>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Identity Card */}
                <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                        {entity.risk_score > 100 && <Skull className="w-16 h-16 text-red-900/20" />}
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-1 group-hover:text-neon-blue transition-colors">
                        {entity.name}
                    </h1>

                    {/* License Holder - Redacted for high-risk entities */}
                    <div className="text-sm font-mono text-zinc-400 mb-4">
                        <span className="text-zinc-600 text-xs">LICENSE HOLDER: </span>
                        {isHighRisk && !declassified ? (
                            <RedactedText text={entity.holder} revealed={declassified} />
                        ) : (
                            <span>{entity.holder}</span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="bg-black/50 p-2 rounded border border-zinc-800">
                            <span className="block text-zinc-500 mb-1">RISK SCORE</span>
                            <span className={`text-xl font-bold ${entity.risk_score > 50 ? 'text-neon-red' : 'text-green-500'}`}>
                                {entity.risk_score}
                            </span>
                        </div>
                        <div className="bg-black/50 p-2 rounded border border-zinc-800">
                            <span className="block text-zinc-500 mb-1">EST. EXPOSURE</span>
                            <span className="text-xl font-bold text-white">
                                ${entity.amount_billed.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Phoenix Analysis (Conditional) */}
                {phoenixFlag && (
                    <div className="border border-neon-red/50 bg-red-950/10 rounded-lg p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-neon-red animate-pulse"></div>
                        <h3 className="text-neon-red font-mono font-bold flex items-center gap-2 mb-3">
                            <FileWarning className="w-4 h-4" />
                            PHOENIX_PROTOCOL DETECTED
                        </h3>
                        <p className="text-xs text-red-200/70 font-mono mb-4">
                            Entity appears to be a reconstituted version of a previously revoked provider.
                        </p>

                        {phoenixPredecessors.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase text-zinc-500 font-mono">Linked Predecessors (Revoked):</p>
                                {phoenixPredecessors.map(prev => (
                                    <div key={prev.id} className="bg-black/80 border border-red-900/50 p-2 rounded flex justify-between items-center">
                                        <div>
                                            <p className="text-red-400 font-bold text-xs">{prev.name}</p>
                                            <p className="text-[10px] text-zinc-500">{prev.id}</p>
                                        </div>
                                        <span className="text-[10px] bg-red-900/50 text-red-200 px-1 py-0.5 rounded">
                                            {prev.status.split(' as of')[0]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-500 italic">Predecessor linkage based on name signature/intel pattern.</p>
                        )}
                    </div>
                )}

                {/* Evidence Flags */}
                <div>
                    <h3 className="text-zinc-400 font-mono text-xs uppercase mb-3 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Forensic Indicators
                    </h3>
                    <ul className="space-y-2">
                        {entity.red_flag_reason.map((reason, i) => (
                            <li key={i} className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-r text-xs font-mono text-zinc-300 border-l-2 border-l-amber-500 flex items-start gap-3">
                                <span className="text-amber-500 font-bold tabular-nums">0{i + 1}</span>
                                {reason}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Network Graph (List View) */}
                {networkPeers.length > 0 && (
                    <div>
                        <h3 className="text-zinc-400 font-mono text-xs uppercase mb-3 flex items-center gap-2">
                            <Network className="w-4 h-4" />
                            Known Network Links ({networkPeers.length})
                        </h3>
                        <div className="bg-black/40 rounded border border-zinc-800 max-h-48 overflow-y-auto custom-scrollbar">
                            {networkPeers.map(peer => (
                                <div key={peer.id} className="p-2 border-b border-zinc-900 flex justify-between items-center hover:bg-zinc-900/50 transition-colors">
                                    <span className="text-xs text-zinc-400 truncate w-2/3">{peer.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${peer.risk_score > 0 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                                        RISK: {peer.risk_score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Helper to find peers (simple pass for now, ideally passed from parent)
