"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Newspaper, Gavel, Database, Clock, ExternalLink } from 'lucide-react';

interface Source {
    title: string;
    type: string;
    source: string;
    matchedKeywords?: string[];
    description?: string;
    lastUpdated?: Date | string;
    link?: string;
}

interface SourceIntelProps {
    sources: Source[];
}

export default function SourceIntel({ sources }: SourceIntelProps) {
    const [intelFeed, setIntelFeed] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadIntel() {
            try {
                // 1. Keep non-news static sources (Legal, Evidence, Reports)
                const staticNonNews = sources.filter(s => s.type !== 'NEWS');

                // 2. Fetch live news (replacing inferior RSS sources)
                const res = await fetch('/api/news?limit=50');
                const data = await res.json();

                let liveNews: Source[] = [];

                if (data.success && data.articles) {
                    liveNews = data.articles.map((a: any) => ({
                        title: a.title,
                        type: 'NEWS',
                        source: a.source,
                        matchedKeywords: a.matchedKeywords || [],
                        description: a.description,
                        lastUpdated: new Date(a.pubDate),
                        link: a.link
                    }));
                }

                // 3. Merge: Prioritize Live News, then Static Legal/Reports
                setIntelFeed([...liveNews, ...staticNonNews]);
            } catch (err) {
                console.error("Failed to load intel feed", err);
                // Fallback to original sources if fail
                setIntelFeed(sources);
            } finally {
                setLoading(false);
            }
        }

        loadIntel();
    }, [sources]);

    // Sort by Date (newest first) if available, then by Type
    const sortedSources = [...intelFeed].sort((a, b) => {
        // Prioritize items with date
        if (a.lastUpdated && !b.lastUpdated) return -1;
        if (!a.lastUpdated && b.lastUpdated) return 1;
        if (a.lastUpdated && b.lastUpdated) {
            return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        }
        return a.type.localeCompare(b.type);
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'LEGAL': return <Gavel className="w-4 h-4" />;
            case 'NEWS': return <Newspaper className="w-4 h-4" />;
            case 'EVIDENCE': return <Database className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'LEGAL': return 'text-amber-500';
            case 'NEWS': return 'text-emerald-400'; // Changed to emerald for live feed vibe
            case 'EVIDENCE': return 'text-neon-red';
            default: return 'text-neon-blue';
        }
    };

    const timeAgo = (date?: Date | string) => {
        if (!date) return null;
        const d = new Date(date);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Updated just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `Updated ${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Updated ${diffInHours}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <section className="py-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                <Database className="w-6 h-6 text-neon-blue" />
                <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
                    SOURCE_INTELLIGENCE
                </h2>
                <div className="ml-auto flex items-center gap-4">
                    {loading && <span className="animate-pulse text-xs font-mono text-neon-blue">SYNCING_FEED...</span>}
                    <span className="text-xs font-mono text-zinc-500">
                        OSINT_ENTRIES: {intelFeed.length}
                    </span>
                </div>
            </div>

            <div className="bg-black border border-zinc-800 p-0 h-[600px] overflow-y-auto font-mono text-sm relative custom-scrollbar">
                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(10,255,0,0.02)_50%)] bg-[length:100%_4px] mix-blend-overlay z-10 sticky top-0" />

                <ul className="divide-y divide-zinc-900">
                    {sortedSources.map((item, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="group relative p-4 hover:bg-zinc-900/50 transition-all duration-200"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded bg-zinc-950 border border-zinc-800 ${getColor(item.type)}`}>
                                    {getIcon(item.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${getColor(item.type)}`}>
                                            {item.type}
                                        </span>
                                        <span className="text-[10px] text-zinc-600">|</span>
                                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider truncate max-w-[150px]">
                                            {item.source}
                                        </span>
                                        {item.lastUpdated && (
                                            <>
                                                <span className="text-[10px] text-zinc-600">|</span>
                                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {timeAgo(item.lastUpdated)}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <h3 className="text-zinc-200 group-hover:text-white transition-colors font-medium leading-snug mb-2 pr-8">
                                        {item.link ? (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start gap-2">
                                                {item.title}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 mt-1" />
                                            </a>
                                        ) : (
                                            item.title
                                        )}
                                    </h3>

                                    {/* Matched Keywords Tags */}
                                    {item.matchedKeywords && item.matchedKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {item.matchedKeywords.map((tag, idx) => (
                                                <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/30 text-amber-500 border border-amber-900/50">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Hover Description Snippet */}
                                    {item.description && (
                                        <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <p className="text-xs text-zinc-500 mt-2 pl-2 border-l-2 border-zinc-700 italic line-clamp-2">
                                                {item.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
