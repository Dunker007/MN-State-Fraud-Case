"use client";

import { motion } from "framer-motion";
import { Share2, AlertTriangle, ChevronRight, Crown, TrendingUp, DollarSign, Building, FileText, Layers } from "lucide-react";
import { type Entity } from "@/lib/schemas";
import { type NetworkKingpin } from "@/lib/leaderboard_rankings";
import ClaimProofButton from "./ClaimProofButton";
import { type Claim } from "@/lib/claim_verification";

interface LeaderboardEntryProps {
    rank: number;
    data: any; // Can be Entity or NetworkKingpin or Cluster
    category: "risk" | "phoenix" | "exposure" | "network" | "cluster";
    onShare: () => void;
    onDetails: () => void;
}

export default function LeaderboardEntry({ rank, data, category, onShare, onDetails }: LeaderboardEntryProps) {
    const isTop3 = rank <= 3;
    const rankColors = {
        1: "from-yellow-300 via-amber-400 to-yellow-500 border-yellow-400",
        2: "from-zinc-300 via-slate-400 to-zinc-500 border-zinc-400",
        3: "from-amber-700 via-orange-800 to-amber-900 border-amber-700"
    };

    // Determine content based on category
    let title = "";
    let subline = "";
    let stat = "";
    let statLabel = "";

    if (category === "risk" || category === "phoenix") {
        const entity = data as any;
        title = entity.name;
        if (entity.is_group) {
            subline = `${entity.group_count} LINKED LOCATIONS`;
        } else {
            subline = entity.red_flag_reason?.[0] || entity.status;
        }
        stat = entity.risk_score.toString();
        statLabel = "MAX RISK";
    } else if (category === "exposure") {
        const entity = data as any;
        title = entity.name;
        if (entity.is_group) {
            subline = `${entity.group_count} LOCATIONS W/ BILLING ACTIVITY`;
        } else {
            subline = entity.status;
        }
        stat = `$${(entity.amount_billed / 1000000).toFixed(1)}M`;
        statLabel = "TOTAL EXPOSURE";
    } else if (category === "network") {
        const kingpin = data as NetworkKingpin;
        title = kingpin.owner;
        subline = `${kingpin.entities.length} ENTITIES LINKED`;
        stat = kingpin.total_risk.toString();
        statLabel = "NET RISK";
    } else if (category === "cluster") {
        const cluster = data as any; // AddressCluster
        title = cluster.address.split(',')[0];
        subline = cluster.city;
        stat = cluster.count.toString();
        statLabel = "ENTITIES";
    }

    // Generate claim for proof button
    const generateClaim = (): Claim => {
        if (category === "risk" || category === "phoenix") {
            const entity = data as Entity;
            return {
                id: `leaderboard-${category}-${rank}`,
                type: "entity_risk",
                statement: `#${rank} ${category === "phoenix" ? "Phoenix Pattern" : "Highest Risk"}: ${entity.name} with score ${entity.risk_score}`,
                entity_id: entity.id,
                evidence: {
                    primary_source: "MN DHS License Lookup Database",
                    verification_url: "https://licensinglookup.dhs.state.mn.us/"
                },
                verification_steps: [
                    "Visit MN DHS License Lookup",
                    `Search for: ${entity.id}`,
                    "Compare status and risk indicators"
                ]
            };
        } else if (category === "exposure") {
            const entity = data as Entity;
            return {
                id: `leaderboard-exposure-${rank}`,
                type: "financial",
                statement: `#${rank} Largest Exposure: ${entity.name} with $${(entity.amount_billed / 1000000).toFixed(1)}M estimated loss`,
                entity_id: entity.id,
                evidence: {
                    primary_source: "MN DHS Billing Records / Federal Estimates"
                },
                verification_steps: [
                    "Review federal indictment filings",
                    "Cross-reference with DHS payment records"
                ]
            };
        } else {
            return {
                id: `leaderboard-${category}-${rank}`,
                type: "pattern",
                statement: `#${rank} on ${category} leaderboard: ${title}`,
                evidence: {
                    primary_source: "Aggregated from MN DHS License Database"
                },
                verification_steps: [
                    "Review address clustering methodology",
                    "Cross-reference entity ownership records"
                ]
            };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: rank * 0.05 }}
            className={`
                group relative bg-zinc-900/50 rounded-lg p-1.5 mb-0.5 border
                ${isTop3 ? 'bg-gradient-to-r from-zinc-900 to-zinc-800' : 'border-zinc-800 hover:border-zinc-600'}
                transition-all hover:bg-zinc-800/80
            `}
            style={isTop3 ? { borderColor: 'transparent' } : {}}
            onClick={onDetails}
        >
            {/* Rank Badge for Top 3 */}
            {isTop3 && (
                <div className={`
                    absolute -left-3 -top-3 w-10 h-10 rounded-full flex items-center justify-center font-black text-black z-10
                    bg-gradient-to-br ${rankColors[rank as keyof typeof rankColors]} shadow-lg shadow-black/50
                    ${rank === 1 ? 'animate-pulse' : ''}
                `}>
                    {rank === 1 ? <Crown className="w-6 h-6" /> : `#${rank}`}
                </div>
            )}
            {/* Border handling for podium */}
            {isTop3 && (
                <div className={`absolute inset-0 rounded-lg border-2 opacity-50 pointer-events-none bg-gradient-to-r ${rankColors[rank as keyof typeof rankColors]} mask-border`} style={{ maskImage: 'linear-gradient(black, black)' }} />
            )}

            <div className={`flex items-center gap-4 ${isTop3 ? 'pl-4' : 'pl-2'}`}>
                {/* Rank Number (if not top 3) */}
                {!isTop3 && (
                    <div className="w-8 flex-shrink-0 text-center font-mono font-bold text-zinc-600 text-lg">
                        #{rank}
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate group-hover:text-white transition-colors ${rank === 1 ? 'text-xl text-white' : 'text-zinc-200'}`}>
                        {title}
                        {data.is_group && <Layers className="inline-block ml-2 w-4 h-4 text-zinc-500" />}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-0.5">
                        {category === "phoenix" && <TrendingUp className="w-3 h-3 text-neon-red" />}
                        <span className="truncate uppercase">{subline}</span>
                    </div>
                </div>

                {/* Stat Block */}
                <div className="text-right">
                    <div className={`font-black font-mono leading-none ${category === "risk" && (parseInt(stat) > 100) ? 'text-neon-red' :
                        category === "exposure" ? 'text-green-400' :
                            'text-white'
                        } ${rank === 1 ? 'text-2xl' : 'text-lg'}`}>
                        {stat}
                    </div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">{statLabel}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 pl-2 border-l border-zinc-800 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ClaimProofButton
                        compact
                        claim={generateClaim()}
                        className="p-1.5"
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); onShare(); }}
                        className="p-1.5 text-zinc-400 hover:text-neon-blue hover:bg-zinc-800 rounded transition-colors"
                        title="Share Card"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDetails(); }}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                        title="Details"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
