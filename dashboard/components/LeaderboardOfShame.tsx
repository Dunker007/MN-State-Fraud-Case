"use client";

import { useState, useMemo } from "react";
import {
    Trophy,
    Flame,
    Link as LinkIcon,
    Building2,
    DollarSign,
    Share2,
    X,
    Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { evidenceData } from "@/lib/data";
import { generateLeaderboards } from "@/lib/leaderboard_rankings";
import { type Entity } from "@/lib/schemas";
import LeaderboardEntry from "./LeaderboardEntry";
import EntityDetailModal from "./EntityDetailModal";

export default function LeaderboardOfShame() {
    const [activeTab, setActiveTab] = useState<"risk" | "phoenix" | "exposure" | "network" | "cluster">("risk");
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [showShareModal, setShowShareModal] = useState<any | null>(null); // Stores data for sharing

    // Determine rankings
    const rankings = useMemo(() => {
        return generateLeaderboards(evidenceData.entities, evidenceData.high_risk_address_clusters);
    }, []);

    const getCurrentList = () => {
        switch (activeTab) {
            case "risk": return rankings.highest_risk;
            case "phoenix": return rankings.phoenix_patterns;
            case "exposure": return rankings.largest_exposure;
            case "network": return rankings.network_kingpins;
            case "cluster": return rankings.address_clusters;
            default: return rankings.highest_risk;
        }
    };

    const currentList = getCurrentList();

    const handleShare = (item: any, rank: number) => {
        console.log("Share", item);
        // In a real app, generate image/social text
        // For now, toggle a dummy modal
        setShowShareModal({ item, rank, category: activeTab });
    };

    return (
        <section className="py-2 relative">
            {/* Header */}
            <div className="text-center mb-2">
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter flex items-center justify-center gap-4">
                    <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 animate-pulse" />
                    <span>Leaderboard of <span className="text-neon-red">Shame</span></span>
                    <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 animate-pulse" />
                </h2>
                <p className="text-zinc-500 font-mono text-[10px] max-w-xl mx-auto mt-1">
                    Ranking the most egregious offenders by Risk Score, Fraud Patterns, and Estimated Public Exposure.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-2">
                <TabButton
                    active={activeTab === "risk"}
                    onClick={() => setActiveTab("risk")}
                    icon={Flame}
                    label="Highest Risk"
                />
                <TabButton
                    active={activeTab === "phoenix"}
                    onClick={() => setActiveTab("phoenix")}
                    icon={LinkIcon}
                    label="Phoenix Patterns"
                    color="text-neon-red"
                />
                <TabButton
                    active={activeTab === "exposure"}
                    onClick={() => setActiveTab("exposure")}
                    icon={DollarSign}
                    label="Largest Loss"
                    color="text-green-400"
                />
                <TabButton
                    active={activeTab === "network"}
                    onClick={() => setActiveTab("network")}
                    icon={Share2}
                    label="Network Kingpins"
                />
                <TabButton
                    active={activeTab === "cluster"}
                    onClick={() => setActiveTab("cluster")}
                    icon={Building2}
                    label="Address Clusters"
                />
            </div>

            {/* List */}
            <div className="max-w-3xl mx-auto min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-0.5"
                    >
                        {/* Header Row */}
                        <div className="flex justify-between px-6 text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">
                            <span>Rank & Name</span>
                            <span>Primary Metric</span>
                        </div>

                        {currentList.map((item: any, i: number) => (
                            <LeaderboardEntry
                                key={i}
                                rank={i + 1}
                                data={item}
                                category={activeTab}
                                onShare={() => handleShare(item, i + 1)}
                                onDetails={() => {
                                    if (activeTab === "network" || activeTab === "cluster") return; // No modal for these yet
                                    setSelectedEntity(item as Entity);
                                }}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Entity Detail Modal */}
            <AnimatePresence>
                {selectedEntity && (
                    <EntityDetailModal
                        entity={selectedEntity}
                        onClose={() => setSelectedEntity(null)}
                        allEntities={evidenceData.entities}
                        onEntityClick={(e) => setSelectedEntity(e)}
                    />
                )}
            </AnimatePresence>

            {/* Share Modal (Mock) */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowShareModal(null)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500" />

                            <h3 className="text-xl font-bold text-white mb-2 uppercase">Wanted Poster Generated</h3>
                            <div className="bg-black border border-zinc-800 p-4 rounded mb-4 font-mono text-left">
                                <div className="text-neon-red text-xs font-bold mb-1">🚨 MN FRAUD WATCH</div>
                                <div className="text-white text-lg font-bold mb-1">
                                    #{showShareModal.rank}: {showShareModal.item.name || showShareModal.item.owner || showShareModal.item.address}
                                </div>
                                <div className="text-zinc-400 text-sm">
                                    Identified on the Leaderboard of Shame.
                                    {showShareModal.category === 'risk' && ` Risk Score: ${showShareModal.item.risk_score}`}
                                    {showShareModal.category === 'exposure' && ` Estimated Loss: $${(showShareModal.item.amount_billed / 1000000).toFixed(1)}M`}
                                </div>
                                <div className="mt-2 text-[10px] text-zinc-600">glasshouse.mn.gov/leaderboard</div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button className="flex items-center justify-center gap-2 bg-white text-black font-bold py-2 rounded hover:bg-zinc-200">
                                    <Camera className="w-4 h-4" /> Save Image
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-[#1DA1F2] text-white font-bold py-2 rounded hover:opacity-90">
                                    <Share2 className="w-4 h-4" /> Tweet
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

function TabButton({ active, onClick, icon: Icon, label, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border
                ${active ? 'bg-zinc-800 text-white border-zinc-600 shadow-lg' : 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-900'}
            `}
        >
            <Icon className={`w-4 h-4 ${active ? (color || 'text-white') : 'text-zinc-600'}`} />
            {label}
        </button>
    );
}
