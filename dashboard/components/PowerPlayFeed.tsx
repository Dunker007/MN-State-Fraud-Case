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
                    <div
                        className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-lg ml-4 cursor-help transition-colors hover:bg-emerald-500/10"
                        title="Hunter Protocol cycles focus every 15 minutes to evade detection and maximize coverage via GDELT."
                    >
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
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="group relative bg-[#070707] border border-white/5 rounded-none overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col h-[380px]"
                            >
                                {/* SCAN LINE ANIMATION */}
                                <div className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <motion.div
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-[1px] bg-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                    />
                                </div>

                                {/* BACKGROUND GRID EFFECT */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] group-hover:opacity-[0.05] transition-opacity" />

                                {/* CARD HEADER: SOURCE & TIME */}
                                <div className="p-5 pb-0 flex items-start justify-between relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-3.5 h-3.5 ${article.type === 'social' ? 'text-purple-400' : 'text-emerald-400'}`} />
                                            <span className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-[0.2em]">
                                                {article.source}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-mono text-zinc-600 tracking-widest uppercase text-[8px] line-clamp-1">
                                            SECURE_INTEL // {article.id.slice(0, 8)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-end gap-1 mb-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTimeAgo(article.pubDate)}
                                        </div>
                                    </div>
                                </div>

                                {/* VIEWPORT / MAIN CONTENT */}
                                <div className="p-5 flex-1 flex flex-col relative z-10">
                                    <h3 className="text-xl font-bold text-white leading-[1.1] mb-4 group-hover:text-purple-300 transition-colors tracking-tight line-clamp-3 uppercase italic">
                                        {article.title}
                                    </h3>

                                    {/* RELEVANCE METER */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">Threat Relevance</span>
                                            <span className={`text-[10px] font-mono font-bold ${article.relevanceScore > 80 ? 'text-red-500' :
                                                article.relevanceScore > 50 ? 'text-yellow-500' : 'text-emerald-500'
                                                }`}>
                                                {article.relevanceScore}%
                                            </span>
                                        </div>
                                        <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${article.relevanceScore}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className={`h-full ${article.relevanceScore > 80 ? 'bg-red-500' :
                                                    article.relevanceScore > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                                                    } shadow-[0_0_8px_currentColor]`}
                                            />
                                        </div>
                                    </div>

                                    {/* DESCRIPTION PREVIEW */}
                                    <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed font-light mb-4 flex-1">
                                        "{article.description}"
                                    </p>

                                    {/* Keywords / Tags */}
                                    <div className="flex flex-wrap gap-1.5 mt-auto">
                                        {article.matchedKeywords.slice(0, 3).map((kw) => (
                                            <span
                                                key={kw}
                                                className="text-[8px] px-2 py-0.5 bg-zinc-950 border border-white/5 text-zinc-400 font-mono uppercase tracking-widest group-hover:border-purple-500/30 transition-colors"
                                            >
                                                {kw.replace(/"/g, '')}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* HOVER ACTION OVERLAY */}
                                <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-12 bg-purple-600 overflow-hidden transition-all duration-300 z-40 flex items-center justify-center">
                                    <Link
                                        href={article.link}
                                        target="_blank"
                                        className="w-full h-full flex items-center justify-center gap-3 text-[10px] font-black text-black uppercase tracking-[0.3em] hover:bg-white transition-colors"
                                    >
                                        Access Full Intel File <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                {/* DECORATIVE CORNER BRACKETS */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/10 group-hover:border-purple-500/50 transition-colors" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/10 group-hover:border-purple-500/50 transition-colors" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/10 group-hover:border-purple-500/50 transition-colors" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/10 group-hover:border-purple-500/50 transition-colors" />
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
