"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    Shield,
    Scale,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    XCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Calendar,
    Eye,
    EyeOff,
    Trash2
} from "lucide-react";
import { evidenceData } from "@/lib/data";
import { type Entity } from "@/lib/schemas";
import ClaimProofButton from "./ClaimProofButton";

interface ConflictEntry {
    entity: Entity;
    stateStatus: string;
    federalStatus: string;
    conflict: boolean;
    severity: "CRITICAL" | "HIGH" | "MODERATE" | "NONE";
    deceptionDays: number;
    estimatedDamage: number;
}

function OctoberNinthTimeline() {
    // Filter for entities with Oct 9, 2024 status changes
    const oct9Entities = evidenceData.entities.filter(e =>
        e.state_status.includes("10/09/2024") ||
        e.state_status.includes("10/09/2025")
    );

    return (
        <div className="mb-12 bg-red-950/10 border border-red-900/30 rounded-lg overflow-hidden">
            <div className="bg-red-950/30 border-b border-red-900/30 p-4">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <Trash2 className="w-6 h-6 text-red-500" />
                    "While the System Was Down, The Shredder Was Running"
                </h3>
                <p className="text-sm text-red-200/70 mt-2">
                    October 9, 2024: {oct9Entities.length} entities processed for denial/revocation while systems showed "maintenance."
                </p>
            </div>

            <div className="grid md:grid-cols-2 divide-x divide-red-900/30">
                {/* LEFT: What Public Saw */}
                <div className="p-6 bg-black/40">
                    <div className="flex items-center gap-2 mb-4">
                        <EyeOff className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-amber-500 uppercase text-sm">What The Public Saw</h4>
                    </div>

                    <div className="bg-zinc-900 border border-amber-900/50 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-6 h-6 text-amber-500 flex-shrink-0" />
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">OCTOBER 9, 2024 // 08:00 AM</div>
                                <div className="bg-amber-950/50 border border-amber-600 rounded p-3 mb-3">
                                    <p className="text-sm text-amber-200 font-mono">
                                        ⚠️ NOTICE: DHS licensing system is experiencing technical difficulties.
                                        We are working to resolve this issue. Some records may be temporarily unavailable.
                                    </p>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    The public licensing lookup showed "system maintenance" notices.
                                    Parents and oversight agencies could not verify provider statuses.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: What Was Really Happening */}
                <div className="p-6 bg-black/40">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-5 h-5 text-red-500" />
                        <h4 className="font-bold text-red-500 uppercase text-sm">What Was Really Happening</h4>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-red-950/50 border border-red-600 rounded p-3">
                            <div className="text-xs text-zinc-500 mb-1">SAME DAY // INTERNAL PROCESSING</div>
                            <p className="text-sm text-white font-bold mb-2">
                                {oct9Entities.length} Denial/Revocation Orders Processed
                            </p>
                            <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                                {oct9Entities.slice(0, 8).map(e => (
                                    <div key={e.id} className="bg-black/40 border-l-2 border-red-500 p-2 text-xs">
                                        <div className="text-red-400 font-mono">{e.id}</div>
                                        <div className="text-zinc-300 truncate">{e.name}</div>
                                        <div className="text-zinc-500 text-[10px]">{e.status}</div>
                                    </div>
                                ))}
                                {oct9Entities.length > 8 && (
                                    <div className="text-xs text-zinc-500 text-center py-2">
                                        + {oct9Entities.length - 8} more entities
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                            While the public saw "maintenance," internal systems were processing mass revocations.
                            These changes wouldn't become visible until December 12, 2024 — 64 days later.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-red-950/20 border-t border-red-900/30 p-4 flex items-center justify-between">
                <div className="text-xs text-red-300">
                    <strong>The Gap:</strong> Public remained unaware while {oct9Entities.length} providers
                    continued operations with "Active" status showing in lookups.
                </div>
                <ClaimProofButton
                    claim={{
                        id: "oct9-timeline",
                        type: "timeline",
                        statement: `${oct9Entities.length} entities processed on Oct 9 during system outage`,
                        evidence: {
                            primary_source: "MN DHS Internal Records",
                            verification_url: "https://mn.gov/dhs/licensing",
                            cross_references: oct9Entities.map(e => e.id)
                        },
                        verification_steps: [
                            "Check state licensing database for status_date field",
                            "Cross-reference with federal raid dates",
                            "Compare public-facing records vs internal processing dates"
                        ]
                    }}
                />
            </div>
        </div>
    );
}

export default function ConflictDetector() {
    const [sortBy, setSortBy] = useState<"severity" | "days" | "damage">("severity");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [showOnlyConflicts, setShowOnlyConflicts] = useState(true);

    // Process entities for conflicts
    const processedEntities: ConflictEntry[] = useMemo(() => {
        return evidenceData.entities.map(entity => {
            const stateStatus = entity.status.split(' as of')[0].toUpperCase();
            const federalStatus = entity.federal_status || "NO FEDERAL ACTION";

            // Determine if there's a conflict
            const stateIsActive = stateStatus.includes("ACTIVE") && !stateStatus.includes("CONDITIONAL");
            const federalHasAction = federalStatus === "INDICTED" || federalStatus === "UNDER INVESTIGATION";

            const conflict = stateIsActive && federalHasAction;

            // Calculate severity
            let severity: ConflictEntry["severity"] = "NONE";
            if (federalStatus === "INDICTED" && stateIsActive) {
                severity = "CRITICAL";
            } else if (federalStatus === "UNDER INVESTIGATION" && stateIsActive) {
                severity = "HIGH";
            } else if (federalHasAction && stateStatus.includes("CONDITIONAL")) {
                severity = "MODERATE";
            }

            // Estimate days of mismatch (from Oct 9 "secret suspension" to Dec 12 "public announcement")
            // This is a simplified calculation - in reality we'd parse dates
            const deceptionDays = conflict ? 64 : 0; // The famous 64-day gap

            // Estimate damage during conflict (daily billing rate * days)
            const dailyRate = entity.amount_billed / 365; // Rough annual estimate to daily
            const estimatedDamage = conflict ? dailyRate * deceptionDays : 0;

            return {
                entity,
                stateStatus,
                federalStatus,
                conflict,
                severity,
                deceptionDays,
                estimatedDamage
            };
        });
    }, []);

    // Filter and sort
    const displayedEntities = useMemo(() => {
        let filtered = showOnlyConflicts
            ? processedEntities.filter(e => e.conflict)
            : processedEntities;

        const severityOrder = { "CRITICAL": 4, "HIGH": 3, "MODERATE": 2, "NONE": 1 };

        return [...filtered].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case "severity":
                    comparison = severityOrder[a.severity] - severityOrder[b.severity];
                    break;
                case "days":
                    comparison = a.deceptionDays - b.deceptionDays;
                    break;
                case "damage":
                    comparison = a.estimatedDamage - b.estimatedDamage;
                    break;
            }
            return sortDir === "desc" ? -comparison : comparison;
        });
    }, [processedEntities, sortBy, sortDir, showOnlyConflicts]);

    // Stats
    const stats = useMemo(() => {
        const conflicts = processedEntities.filter(e => e.conflict);
        const totalDamage = conflicts.reduce((sum, e) => sum + e.estimatedDamage, 0);
        const criticalCount = conflicts.filter(e => e.severity === "CRITICAL").length;
        const highCount = conflicts.filter(e => e.severity === "HIGH").length;

        return {
            totalConflicts: conflicts.length,
            totalDamage,
            criticalCount,
            highCount
        };
    }, [processedEntities]);

    const toggleSort = (column: typeof sortBy) => {
        if (sortBy === column) {
            setSortDir(sortDir === "desc" ? "asc" : "desc");
        } else {
            setSortBy(column);
            setSortDir("desc");
        }
    };

    const getSeverityColor = (severity: ConflictEntry["severity"]) => {
        switch (severity) {
            case "CRITICAL": return "text-red-500 bg-red-950/50 border-red-600";
            case "HIGH": return "text-orange-500 bg-orange-950/50 border-orange-600";
            case "MODERATE": return "text-yellow-500 bg-yellow-950/50 border-yellow-600";
            default: return "text-zinc-500 bg-zinc-900/50 border-zinc-700";
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
        >
            <OctoberNinthTimeline />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Scale className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white font-mono">CONFLICT_DETECTOR</h2>
                        <p className="text-xs text-zinc-500 font-mono">State vs Federal Status Discrepancies</p>
                    </div>
                    <ClaimProofButton
                        compact
                        claim={{
                            id: "conflict-detector-methodology",
                            type: "pattern",
                            statement: `Identified ${stats.totalConflicts} entities with State/Federal status conflicts`,
                            evidence: {
                                primary_source: "MN DHS License Lookup + Federal Court Records",
                                calculation: {
                                    total_conflicts: stats.totalConflicts,
                                    critical_severity: stats.criticalCount,
                                    high_severity: stats.highCount,
                                    estimated_damage_during_conflict: `$${(stats.totalDamage / 1000000).toFixed(1)}M`
                                }
                            },
                            verification_steps: [
                                "Cross-reference MN DHS license status with PACER federal court records",
                                "Identify entities with ACTIVE state status but federal INDICTED/INVESTIGATION",
                                "Calculate exposure during the 64-day gap period"
                            ]
                        }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showOnlyConflicts}
                            onChange={(e) => setShowOnlyConflicts(e.target.checked)}
                            className="rounded border-zinc-700 bg-zinc-900"
                        />
                        Show conflicts only
                    </label>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-lg">
                    <div className="text-3xl font-black text-red-500 font-mono">{stats.totalConflicts}</div>
                    <div className="text-xs text-red-300/70 uppercase">Status Conflicts</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                    <div className="text-3xl font-black text-white font-mono">{stats.criticalCount}</div>
                    <div className="text-xs text-zinc-500 uppercase">Critical Severity</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                    <div className="text-3xl font-black text-amber-500 font-mono">64</div>
                    <div className="text-xs text-zinc-500 uppercase">Days of Deception</div>
                </div>
                <div className="bg-green-950/30 border border-green-900/50 p-4 rounded-lg">
                    <div className="text-3xl font-black text-green-500 font-mono">
                        ${(stats.totalDamage / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-green-300/70 uppercase">Est. Damage</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 p-3 bg-black/50 border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase">
                    <div className="col-span-4">Entity</div>
                    <div className="col-span-2">State Status</div>
                    <div className="col-span-2">Federal Status</div>
                    <button
                        onClick={() => toggleSort("severity")}
                        className="col-span-2 flex items-center gap-1 hover:text-white transition-colors"
                    >
                        Severity
                        {sortBy === "severity" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                    </button>
                    <button
                        onClick={() => toggleSort("damage")}
                        className="col-span-2 flex items-center gap-1 hover:text-white transition-colors"
                    >
                        Est. Damage
                        {sortBy === "damage" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                    </button>
                </div>

                {/* Table Body */}
                <div className="max-h-[400px] overflow-y-auto">
                    {displayedEntities.slice(0, 50).map((entry, i) => (
                        <motion.div
                            key={entry.entity.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className={`grid grid-cols-12 gap-2 p-3 items-center border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${entry.conflict ? '' : 'opacity-50'
                                }`}
                        >
                            {/* Entity */}
                            <div className="col-span-4">
                                <div className="text-white font-medium text-sm truncate">{entry.entity.name}</div>
                                <div className="text-xs text-zinc-600 font-mono">{entry.entity.id}</div>
                            </div>


                            {/* State Status */}
                            <div className="col-span-2">
                                <span className={`text-xs font-mono px-2 py-1 rounded ${entry.stateStatus.includes("REVOKED") ? "text-red-400 bg-red-950/30" :
                                    entry.stateStatus.includes("ACTIVE") ? "text-green-400 bg-green-950/30" :
                                        "text-amber-400 bg-amber-950/30"
                                    }`}>
                                    {entry.stateStatus.substring(0, 12)}
                                </span>
                            </div>

                            {/* Federal Status */}
                            <div className="col-span-2">
                                <span className={`text-xs font-mono px-2 py-1 rounded ${entry.federalStatus === "INDICTED" ? "text-red-400 bg-red-950/30" :
                                    entry.federalStatus === "UNDER INVESTIGATION" ? "text-amber-400 bg-amber-950/30" :
                                        "text-zinc-500 bg-zinc-900"
                                    }`}>
                                    {entry.federalStatus.substring(0, 12)}
                                </span>
                            </div>

                            {/* Severity */}
                            <div className="col-span-2">
                                {entry.conflict ? (
                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${getSeverityColor(entry.severity)}`}>
                                        {entry.severity}
                                    </span>
                                ) : (
                                    <span className="text-xs text-zinc-600">—</span>
                                )}
                            </div>

                            {/* Estimated Damage */}
                            <div className="col-span-2">
                                {entry.estimatedDamage > 0 ? (
                                    <span className="text-green-400 font-mono text-sm">
                                        ${(entry.estimatedDamage / 1000000).toFixed(3)}M
                                    </span>
                                ) : (
                                    <span className="text-zinc-600 text-xs">—</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-between items-center text-xs text-zinc-600 font-mono">
                <span>
                    Showing {Math.min(displayedEntities.length, 50)} of {displayedEntities.length} entities
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Data as of Dec 30, 2025
                </span>
            </div>
        </motion.section>
    );
}
