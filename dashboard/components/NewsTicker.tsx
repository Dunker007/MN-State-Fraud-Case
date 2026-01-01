"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Newspaper, ExternalLink } from "lucide-react";

interface NewsArticle {
    id: string;
    title: string;
    link: string;
    source: string;
    relevanceScore: number;
}

export default function NewsTicker() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTopNews = async () => {
        try {
            const response = await fetch('/api/news?minScore=5&limit=10');
            const data = await response.json();

            if (data.success) {
                setArticles(data.articles);
            }
        } catch (err) {
            console.error('News ticker fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopNews();
        // Refresh every 5 minutes
        const interval = setInterval(fetchTopNews, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Create ticker content with all articles (or loading state)
    const tickerItems = loading || articles.length === 0
        ? [{ id: 'loading', text: 'Loading live intel...', link: '#', source: 'SYSTEM', relevance: 'INFO' }]
        : articles.map((article) => ({
            id: article.id,
            text: article.title,
            link: article.link,
            source: article.source,
            relevance: article.relevanceScore >= 10 ? 'HIGH' : 'MEDIUM'
        }));

    return (
        <div className="w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-cyan-900/30 overflow-hidden relative">
            {/* Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-zinc-950 pr-2">
                <Newspaper className={`w-4 h-4 text-cyan-500 ${loading ? 'animate-pulse' : ''}`} />
            </div>

            {/* Scrolling ticker */}
            <div className="flex whitespace-nowrap py-2 pl-12">
                <motion.div
                    className="flex gap-8 text-cyan-100 font-mono text-xs"
                    animate={{ x: loading ? 0 : [0, -2000] }}
                    transition={{
                        repeat: loading ? 0 : Infinity,
                        ease: "linear",
                        duration: 60,
                    }}
                >
                    {/* Repeat items for seamless loop (only if loaded) */}
                    {[...Array(loading ? 1 : 3)].map((_, repeatIndex) => (
                        <div key={repeatIndex} className="flex gap-8">
                            {tickerItems.map((item) => (
                                <a
                                    key={`${item.id}-${repeatIndex}`}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 transition-colors group ${loading ? 'pointer-events-none' : 'hover:text-cyan-400'
                                        }`}
                                >
                                    {item.relevance !== 'INFO' && (
                                        <>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${item.relevance === 'HIGH'
                                                ? 'bg-red-950/50 text-red-400 border border-red-900/50'
                                                : 'bg-amber-950/50 text-amber-400 border border-amber-900/50'
                                                }`}>
                                                {item.relevance}
                                            </span>
                                            <span className="text-zinc-600">•</span>
                                        </>
                                    )}
                                    <span className={loading ? 'text-zinc-500' : ''}>{item.text}</span>
                                    {item.relevance !== 'INFO' && (
                                        <>
                                            <span className="text-[9px] text-zinc-600">({item.source})</span>
                                            <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </>
                                    )}
                                </a>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
