"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, AlertTriangle, ChevronRight, X, Download, ExternalLink } from "lucide-react";
import { evidenceData } from "@/lib/data";
import { type Entity, type AddressCluster } from "@/lib/schemas";

export default function AddressCluster() {
    const additionalClusters = [
        { address: "343 WOOD LAKE DR SE", city: "ROCHESTER", count: 4, ids: ["MN-802789", "MN-802787", "MN-830308", "MN-803872"] },
        { address: "14750 LAC LAVON DR", city: "BURNSVILLE", count: 3, ids: ["MN-1117656", "MN-1117660", "MN-1103458"] },
        { address: "930 1ST ST NE", city: "FARIBAULT", count: 3, ids: ["MN-1114358", "MN-1026846", "MN-1128083"] }
    ];
    const clusters = [...evidenceData.high_risk_address_clusters, ...additionalClusters];
    const [selectedCluster, setSelectedCluster] = useState<AddressCluster | null>(null);

    const getEntitiesAtAddress = (address: string): Entity[] => {
        return evidenceData.entities.filter(e =>
            e.address.toLowerCase().includes(address.toLowerCase())
        );
    };

    const handleExportCSV = (cluster: AddressCluster, entities: Entity[]) => {
        const headers = ["ID", "Name", "Type", "Status", "Risk Score", "Owner", "Address"];
        const rows = entities.map(e => [
            e.id,
            e.name,
            e.type,
            e.status,
            e.risk_score,
            e.owner,
            `"${e.address}"` // Quote address to handle commas
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `cluster_${cluster.address.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <>
            <section className="bg-zinc-900/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-neon-red" />
                    <h2 className="text-lg font-bold text-white font-mono">
                        HIGH_RISK_ADDRESS_CLUSTERS
                    </h2>
                </div>

                <div className="space-y-3">
                    {clusters.map((cluster, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedCluster(cluster)}
                            className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded cursor-pointer hover:border-amber-500/50 hover:bg-zinc-800/80 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-900/20 p-2 rounded text-amber-500 font-bold font-mono min-w-[32px] text-center">
                                    {cluster.count}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-zinc-200 group-hover:text-white font-mono">
                                        {cluster.address}
                                    </div>
                                    <div className="text-xs text-zinc-500 font-mono">
                                        {cluster.city} // SYSTEM_FLAG: MULTI_TENANT_RISK
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Inspect Modal */}
            <AnimatePresence>
                {selectedCluster && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCluster(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl max-h-[80vh] z-[70] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-900">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle className="w-5 h-5 text-neon-red" />
                                        <h3 className="text-xl font-bold text-white font-mono">
                                            CLUSTER_INSPECTOR
                                        </h3>
                                    </div>
                                    <p className="text-sm text-zinc-400 font-mono">
                                        {selectedCluster.address}, {selectedCluster.city}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCluster.address + ", " + selectedCluster.city + ", MN")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                        title="View on Google Maps"
                                    >
                                        <MapPin className="w-5 h-5" />
                                    </a>
                                    <button
                                        onClick={() => handleExportCSV(selectedCluster, getEntitiesAtAddress(selectedCluster.address))}
                                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                        title="Export CSV"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedCluster(null)}
                                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {getEntitiesAtAddress(selectedCluster.address).map(entity => (
                                    <div key={entity.id} className="bg-black/40 border border-zinc-800 p-3 rounded flex justify-between items-center group hover:border-zinc-600 transition-colors">
                                        <div>
                                            <div className="text-sm font-bold text-white group-hover:text-neon-blue">
                                                {entity.name}
                                            </div>
                                            <div className="text-xs text-zinc-500 font-mono">
                                                {entity.id} • {entity.type}
                                            </div>
                                            {entity.owner && entity.owner !== "UNKNOWN" && (
                                                <div className="text-[10px] text-zinc-400 mt-1">
                                                    OWNER: {entity.owner}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${entity.risk_score > 80 ? 'bg-red-900/30 text-red-500' :
                                            entity.risk_score > 50 ? 'bg-amber-900/30 text-amber-500' : 'bg-green-900/30 text-green-500'
                                            }`}>
                                            RISK: {entity.risk_score}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 text-center">
                                <div className="text-[10px] text-zinc-500 font-mono">
                                    TOTAL_CLUSTER_RISK: <span className="text-neon-red font-bold">
                                        {getEntitiesAtAddress(selectedCluster.address).reduce((sum, e) => sum + e.risk_score, 0)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
