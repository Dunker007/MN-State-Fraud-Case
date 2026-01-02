"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    ExternalLink,
    Filter,
    Search,
    TrendingUp,
    Globe,
    Shield,
    Video,
    MessageCircle,
    Twitter,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import { NewsArticle } from '@/lib/news-scraper';
import Link from 'next/link';

interface PowerPlayFeedProps {
    initialArticles: NewsArticle[];
}

export default function PowerPlayFeed({ initialArticles }: PowerPlayFeedProps) {
    const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
    const [filter, setFilter] = useState<'all' | 'high-risk' | 'social'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(12);
    const [hunterPhase, setHunterPhase] = useState<string>('');

    useEffect(() => {
        // Sync with Server-Side Hunter Protocol Logic (approximate client sync)
        const updatePhase = () => {
            const minutes = new Date().getMinutes();
            if (minutes < 15) setHunterPhase('PHASE 1: HIGH VALUE TARGETS (GLOBAL)');
            else if (minutes < 30) setHunterPhase('PHASE 2: HONEY POTS (NATIONAL)');
            else if (minutes < 45) setHunterPhase('PHASE 3: MECHANISMS (NATIONAL)');
            else setHunterPhase('PHASE 4: THE SPIDERWEB (MN FOCUS)');
        };

        updatePhase();
        const interval = setInterval(updatePhase, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const filteredArticles = useMemo(() => {
        let filtered = articles;

        // Apply type filter
        if (filter === 'high-risk') {
            filtered = filtered.filter(a => a.relevanceScore >= 80);
        } else if (filter === 'social') {
            filtered = filtered.filter(a => a.type === 'social' || ['youtube', 'twitter', 'reddit'].some(platform => a.source.toLowerCase().includes(platform)));
        }

        // Apply search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q) ||
                a.matchedKeywords.some(k => k.toLowerCase().includes(q))
            );
        }

        return filtered;
    }, [articles, filter, searchQuery]);

    const visibleArticles = filteredArticles.slice(0, displayLimit);

    // ... existing handlers ...

    const handleLoadMore = () => {
        setLoading(true);
        // Simulate network delay for "Load More" effect or fetch real next page
        setTimeout(() => {
            setDisplayLimit(prev => prev + 12);
            setLoading(false);
        }, 600);
    };

    const formatTimeAgo = (date: string | Date) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return 'Just now';
    };

    const getSourceIcon = (source: string, type?: string) => {
        const s = source.toLowerCase();
        if (s.includes('youtube')) return Video;
        if (s.includes('twitter') || s.includes('x.com')) return Twitter;
        if (s.includes('reddit')) return MessageCircle;
        if (type === 'social') return MessageCircle;
        return Globe; // Default for news
    };

    return (
        <div className="space-y-8">
            {/* Top Filters Bar */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10 p-4 -mx-4 md:-mx-8 md:px-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-xs font-mono rounded-full border transition-all ${filter === 'all'
                            ? 'bg-white text-black border-white'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                            }`}
                    >
                        ALL_INTEL
                    </button>
                    <button
                        onClick={() => setFilter('high-risk')}
                        className={`px-4 py-2 text-xs font-mono rounded-full border transition-all flex items-center gap-2 ${filter === 'high-risk'
                            ? 'bg-red-500/10 text-red-400 border-red-500/50'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                            }`}
                    >
                        <Shield className="w-3 h-3" />
                        HIGH_PRIORITY
                    </button>
                    <button
                        onClick={() => setFilter('social')}
                        className={`px-4 py-2 text-xs font-mono rounded-full border transition-all flex items-center gap-2 ${filter === 'social'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/50'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                            }`}
                    >
                        <TrendingUp className="w-3 h-3" />
                        SOCIAL_SIGNALS
                    </button>

                    {/* Hunter Protocol Badge */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-lg ml-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
                            HUNTING: {hunterPhase}
                        </span>
                    </div>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Filter by keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 font-mono"
                    />
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {visibleArticles.map((article, index) => {
                        const Icon = getSourceIcon(article.source, article.type);

                        return (
                            <motion.article
                                key={article.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="group relative bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col h-[320px]"
                            >
                                {/* Card Header */}
                                <div className="p-5 flex-1 flex flex-col relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${article.type === 'social' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                                                }`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                                {article.source}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTimeAgo(article.pubDate)}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-zinc-100 leading-tight mb-2 group-hover:text-white transition-colors line-clamp-3">
                                        {article.title}
                                    </h3>

                                    {/* Keywords */}
                                    <div className="flex flex-wrap gap-1 mt-auto">
                                        {article.matchedKeywords.slice(0, 3).map((kw) => (
                                            <span
                                                key={kw}
                                                className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono uppercase tracking-tighter"
                                            >
                                                #{kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Hover Reveal Description */}
                                <div className="absolute inset-0 bg-zinc-900/95 backdrop-blur-sm p-6 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-6 font-mono">
                                        {article.description}
                                    </p>
                                    <Link
                                        href={article.link}
                                        target="_blank"
                                        className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-white hover:text-emerald-400 transition-colors uppercase tracking-widest"
                                    >
                                        Read Source <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                {/* Background Gradient for Pop */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50 pointer-events-none" />
                            </motion.article>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Load More Trigger */}
            {filteredArticles.length > displayLimit && (
                <div className="flex justify-center py-12">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="group flex items-center gap-3 px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
                    >
                        {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <span className="text-sm font-mono uppercase tracking-widest">Load More Intel</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
