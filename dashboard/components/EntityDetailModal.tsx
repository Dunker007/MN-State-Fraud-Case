"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ShieldAlert,
    Network,
    FileWarning,
    Skull,
    ExternalLink,
    Copy,
    Flag,
    Printer,
    Share2,
    Bookmark,
    ChevronRight,
    Building2,
    Calendar,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Search
} from "lucide-react";
import { useState } from "react";
import RedactedText from "./RedactedText";

import { type Entity } from "@/lib/schemas";
import CitationFooter from "./CitationFooter";
import ClaimProofButton from "./ClaimProofButton";
import { type Claim } from "@/lib/claim_verification";

// Removed local Entity interface to use shared Zod schema type


interface EntityDetailModalProps {
    entity: Entity | null;
    onClose: () => void;
    allEntities: Entity[];
    onEntityClick: (entity: Entity) => void;
    onCopyId?: () => void;
    onFlag?: () => void;
    onShare?: () => void;
}

export default function EntityDetailModal({
    entity,
    onClose,
    allEntities,
    onEntityClick,
    onCopyId,
    onFlag,
    onShare
}: EntityDetailModalProps) {
    const [declassified, setDeclassified] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "network" | "timeline">("overview");

    if (!entity) return null;

    const isHighRisk = entity.risk_score > 50;

    // Network peers
    const networkPeers = entity.network_ids
        ? allEntities.filter(e => entity.network_ids?.includes(e.id) && e.id !== entity.id)
        : [];

    // Phoenix detection
    const phoenixFlag = entity.red_flag_reason.find(f => f.includes("PHOENIX_PROTOCOL"));
    let phoenixPredecessors: Entity[] = [];
    if (phoenixFlag) {
        phoenixPredecessors = networkPeers.filter(p =>
            p.status.includes("REVOKED") || p.status.includes("DENIED")
        );
        if (phoenixPredecessors.length === 0) {
            const stem = entity.name.split(' ')[0].toUpperCase();
            if (stem.length > 3) {
                phoenixPredecessors = allEntities.filter(e =>
                    e.name.toUpperCase().startsWith(stem) &&
                    (e.status.includes("REVOKED") || e.status.includes("DENIED"))
                );
            }
        }
    }

    // Parse date from status
    const statusDate = entity.status.match(/as of (\d{2}\/\d{2}\/\d{4})/)?.[1];

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            <motion.div
                key="modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-[5%] left-1/2 -translate-x-1/2 w-full max-w-3xl h-[90vh] z-50 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-black/50">
                    <div className="flex items-center gap-3">
                        <div className={`p - 2 rounded ${isHighRisk ? 'bg-red-950/50' : 'bg-green-950/50'} `}>
                            <Building2 className={`w - 5 h - 5 ${isHighRisk ? 'text-neon-red' : 'text-green-500'} `} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{entity.name}</h2>
                            <p className="text-xs text-zinc-500 font-mono">{entity.id}</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onCopyId}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                            title="Copy ID"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onFlag}
                            className="p-2 text-zinc-500 hover:text-amber-500 hover:bg-zinc-800 rounded transition-colors"
                            title="Flag for Review"
                        >
                            <Flag className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onShare}
                            className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-zinc-800 rounded transition-colors"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => window.open(`/ briefing ? ids = ${entity.id} `, '_blank')}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors bg-zinc-800/50"
                            title="Generate Briefing PDF"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                // Copy ID to clipboard and open search
                                navigator.clipboard.writeText(entity.id);
                                window.open("https://licensinglookup.dhs.state.mn.us/", "_blank");
                            }}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors bg-blue-900/20 text-blue-400 border border-blue-900/50"
                            title="Open DHS Lookup (ID Copied)"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-zinc-800">
                    {["overview", "network", "timeline"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px - 4 py - 2 text - sm font - mono uppercase transition - colors ${activeTab === tab
                                ? "text-white border-b-2 border-neon-red"
                                : "text-zinc-500 hover:text-white"
                                } `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {activeTab === "overview" && (
                        <>
                            {/* Risk Score & Status */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-black/50 p-4 rounded border border-zinc-800 relative group">
                                    <div className="text-xs text-zinc-500 font-mono uppercase mb-1">Risk Score</div>
                                    <div className={`text-3xl font-bold font-mono ${isHighRisk ? 'text-neon-red' : 'text-green-500'}`}>
                                        {entity.risk_score}
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ClaimProofButton
                                            compact
                                            claim={{
                                                id: `risk-${entity.id}`,
                                                type: "entity_risk",
                                                statement: `${entity.name} has a risk score of ${entity.risk_score}`,
                                                entity_id: entity.id,
                                                evidence: {
                                                    primary_source: "MN DHS License Lookup Database",
                                                    verification_url: entity.source_url || "https://licensinglookup.dhs.state.mn.us/",
                                                    calculation: {
                                                        base_score: 0,
                                                        status_modifier: entity.status.includes("REVOKED") ? "+100" : "0",
                                                        federal_status: entity.federal_status === "INDICTED" ? "+200" : "0",
                                                        network_links: `+${entity.linked_count * 10}`,
                                                        red_flags: `+${entity.red_flag_reason.length * 25}`,
                                                        total: entity.risk_score
                                                    }
                                                },
                                                verification_steps: [
                                                    `Visit MN DHS License Lookup: licensinglookup.dhs.state.mn.us`,
                                                    `Search for license ID: ${entity.id}`,
                                                    `Compare status: ${entity.status.split(' as of')[0]}`,
                                                    `Review any red flag indicators`
                                                ],
                                                legal_citation: "Minnesota Statutes §245D.06"
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-black/50 p-4 rounded border border-zinc-800">
                                    <div className="text-xs text-zinc-500 font-mono uppercase mb-1">Est. Exposure</div>
                                    <div className="text-3xl font-bold font-mono text-white">
                                        ${(entity.amount_billed / 1000000).toFixed(2)}M
                                    </div>
                                </div>
                                <div className="bg-black/50 p-4 rounded border border-zinc-800">
                                    <div className="text-xs text-zinc-500 font-mono uppercase mb-1">Network Links</div>
                                    <div className="text-3xl font-bold font-mono text-purple-500">
                                        {entity.linked_count}
                                    </div>
                                </div>
                            </div>

                            {/* Status Details */}
                            <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
                                <h3 className="text-xs text-zinc-500 font-mono uppercase mb-3">License Status</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-400 text-sm">Current Status</span>
                                        <span className={`text - sm font - mono ${entity.status.includes("REVOKED") ? "text-neon-red" :
                                            entity.status.includes("CONDITIONAL") ? "text-amber-500" :
                                                "text-green-500"
                                            } `}>
                                            {entity.status.split(' as of')[0]}
                                        </span>
                                    </div>
                                    {statusDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-400 text-sm">Status Date</span>
                                            <span className="text-zinc-300 text-sm font-mono flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {statusDate}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-400 text-sm">License Holder</span>
                                        <span className="text-zinc-300 text-sm">
                                            {isHighRisk && !declassified ? (
                                                <RedactedText text={entity.holder} revealed={declassified} />
                                            ) : (
                                                entity.holder
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-500">PROVIDER_ID</span>
                                        <span className="text-white font-mono">{entity.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-500">LICENSE_TYPE</span>
                                        <span className="text-white font-mono">{entity.type}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-500">COUNTY</span>
                                        <span className="text-white font-mono">{entity.city}</span>
                                    </div>
                                </div>

                                <CitationFooter
                                    source="MN DHS License Lookup"
                                    date={entity.last_verified || "Dec 30, 2025"}
                                    url={entity.source_url}
                                />
                            </div>

                            {/* Phoenix Alert */}
                            {phoenixFlag && (
                                <div className="bg-red-950/20 border border-red-900/50 rounded p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Skull className="w-5 h-5 text-neon-red" />
                                        <h3 className="text-neon-red font-mono font-bold">PHOENIX PROTOCOL DETECTED</h3>
                                    </div>
                                    <p className="text-xs text-red-200/70 mb-3">
                                        Entity appears to be a reconstituted version of a previously revoked provider.
                                    </p>
                                    {phoenixPredecessors.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-zinc-500 uppercase">Linked Predecessors:</p>
                                            {phoenixPredecessors.slice(0, 3).map(pred => (
                                                <button
                                                    key={pred.id}
                                                    onClick={() => onEntityClick(pred)}
                                                    className="w-full bg-black/50 border border-red-900/30 p-2 rounded flex justify-between items-center hover:border-red-600 transition-colors"
                                                >
                                                    <div className="text-left">
                                                        <p className="text-red-400 text-sm font-bold">{pred.name}</p>
                                                        <p className="text-[10px] text-zinc-500">{pred.id}</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Red Flags */}
                            {entity.red_flag_reason.length > 0 && (
                                <div>
                                    <h3 className="text-xs text-zinc-500 font-mono uppercase mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Forensic Indicators ({entity.red_flag_reason.length})
                                    </h3>
                                    <ul className="space-y-2">
                                        {entity.red_flag_reason.map((reason, i) => (
                                            <li key={i} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded text-xs text-zinc-300 border-l-2 border-l-amber-500">
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "network" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs text-zinc-500 font-mono uppercase flex items-center gap-2">
                                    <Network className="w-4 h-4" />
                                    Network Connections ({networkPeers.length})
                                </h3>
                            </div>

                            {networkPeers.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500">
                                    <Network className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No network connections detected</p>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    {networkPeers.map(peer => (
                                        <button
                                            key={peer.id}
                                            onClick={() => onEntityClick(peer)}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded flex justify-between items-center hover:border-zinc-600 transition-colors text-left"
                                        >
                                            <div>
                                                <p className="text-white text-sm">{peer.name}</p>
                                                <p className="text-[10px] text-zinc-500 font-mono">{peer.id}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text - xs font - mono px - 2 py - 0.5 rounded ${peer.risk_score > 50 ? 'bg-red-950/50 text-red-400' : 'bg-green-950/50 text-green-400'
                                                    } `}>
                                                    {peer.risk_score}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-zinc-500" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "timeline" && (
                        <div className="text-center py-12 text-zinc-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium mb-2">Timeline View</p>
                            <p className="text-sm">Status history and audit trail coming soon</p>
                            <p className="text-xs mt-4 text-zinc-600">
                                This feature will show license status changes over time
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-zinc-800 bg-black/50 flex justify-between items-center text-xs font-mono text-zinc-600">
                    <span>Last synced: {new Date().toLocaleString()}</span>
                    <button
                        onClick={() => setDeclassified(!declassified)}
                        className={`px - 3 py - 1 rounded border transition - colors ${declassified
                            ? 'border-green-600 text-green-400'
                            : 'border-zinc-700 text-zinc-500 hover:text-white'
                            } `}
                    >
                        {declassified ? '🔓 DECLASSIFIED' : '🔒 DECLASSIFY'}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
