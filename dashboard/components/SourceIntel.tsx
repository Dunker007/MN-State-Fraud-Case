"use client";

import { motion } from "framer-motion";
import { FileText, Newspaper, Gavel, Database } from "lucide-react";

interface Source {
    title: string;
    type: string;
    source: string;
}

interface SourceIntelProps {
    sources: Source[];
}

export default function SourceIntel({ sources }: SourceIntelProps) {
    // Sort by type for grouping
    const sortedSources = [...sources].sort((a, b) => a.type.localeCompare(b.type));

    const getIcon = (type: string) => {
        switch (type) {
            case "LEGAL": return <Gavel className="w-4 h-4" />;
            case "NEWS": return <Newspaper className="w-4 h-4" />;
            case "EVIDENCE": return <Database className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case "LEGAL": return "text-amber-500";
            case "NEWS": return "text-zinc-400";
            case "EVIDENCE": return "text-neon-red";
            default: return "text-neon-blue";
        }
    };

    return (
        <section className="py-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                <Database className="w-6 h-6 text-neon-blue" />
                <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
                    SOURCE_INTELLIGENCE
                </h2>
                <span className="ml-auto text-xs font-mono text-zinc-500">
                    OSINT_ENTRIES: {sources.length}
                </span>
            </div>

            <div className="bg-black border border-zinc-800 p-4 h-[400px] overflow-y-auto font-mono text-sm relative custom-scrollbar">
                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(10,255,0,0.02)_50%)] bg-[length:100%_4px] mix-blend-overlay z-10" />

                <ul className="space-y-2 relative z-0">
                    {sortedSources.map((item, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-start gap-3 p-2 hover:bg-zinc-900 border-b border-zinc-900/50 group"
                        >
                            <div className={`mt-0.5 ${getColor(item.type)} opacity-70 group-hover:opacity-100`}>
                                {getIcon(item.type)}
                            </div>
                            <div className="flex-1">
                                <span className={`text-[10px] uppercase border px-1 rounded mr-2 ${getColor(item.type)} border-current opacity-50`}>
                                    {item.type}
                                </span>
                                <span className="text-zinc-300 group-hover:text-white transition-colors">
                                    {item.title}
                                </span>
                                <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">
                                    SOURCE_ORIGIN: {item.source}
                                </div>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
