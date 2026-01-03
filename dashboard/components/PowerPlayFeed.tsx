"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    ExternalLink,
    Search,
    TrendingUp,
    Globe,
    Shield,
    Video,
    MessageCircle,
    Twitter,
    RefreshCw,
    PlayCircle
} from 'lucide-react';
import { NewsArticle } from '@/lib/news-scraper';
import Link from 'next/link';
import { getFreshIntelAction } from '@/app/actions';

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
    const [lastFetchPhase, setLastFetchPhase] = useState<string>('');

    useEffect(() => {
        // Sync with Server-Side Hunter Protocol Logic + Data Fetching
        const updateCycle = async () => {
            const minutes = new Date().getMinutes();
            let currentPhase = '';

            if (minutes < 15) currentPhase = 'PHASE 1: HIGH VALUE TARGETS (GLOBAL)';
            else if (minutes < 30) currentPhase = 'PHASE 2: HONEY POTS (NATIONAL)';
            else if (minutes < 45) currentPhase = 'PHASE 3: MECHANISMS (NATIONAL)';
            else currentPhase = 'PHASE 4: THE SPIDERWEB (MN FOCUS)';

            setHunterPhase(currentPhase);

            // Re-fetch if phase changed or initial load
            // We use a simpler check: if local phase != calculated phase
            if (currentPhase !== lastFetchPhase) {
                console.log(`[HUNTER PROTOCOL] Phase shift detected: ${currentPhase}. Re-indexing...`);
                setLoading(true);
                setLastFetchPhase(currentPhase);

                try {
                    const result = await getFreshIntelAction();
                    if (result.success && result.articles.length > 0) {
                        setArticles(result.articles);
                    }
                } catch (e) {
                    console.error("Auto-fetch failed", e);
                } finally {
                    setLoading(false);
                }
            }
        };

        updateCycle(); // Run immediately
        const interval = setInterval(updateCycle, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [lastFetchPhase]);

    const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

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

    const handleLoadMore = () => {
        setLoading(true);
        setTimeout(() => {
            setDisplayLimit(prev => prev + 42);
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

    const getYouTubeEmbedUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}`;
        // Fallback or Vimeo support could be added here
        return url;
    };

    return (
        <div className="space-y-8">
            {/* Top Sticky Bar */}
            <div className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-xl border-b border-zinc-800 p-3 -mx-4 md:-mx-8 md:px-8 flex flex-col lg:flex-row gap-4 lg:items-center justify-between shadow-2xl">

                {/* Sticky Branding & Count */}
                <div className="flex items-center justify-between lg:justify-start w-full lg:w-auto gap-6">
                    <div className="flex items-center gap-3">
                        <span className="font-black italic tracking-tighter uppercase text-sm md:text-base">
                            <span className="text-red-600">POWER</span> <span className="text-white">PLAY</span> <span className="text-blue-500">PRESS</span>
                        </span>
                        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-mono font-bold text-red-500">{articles.length} LIVE</span>
                        </div>
                    </div>

                    {/* Mobile Hunter Badge / Desktop Phase Indicator */}
                    <div
                        className="flex items-center gap-2 px-2 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded cursor-help"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-tighter">
                            {hunterPhase || 'HUNTING'}
                        </span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 lg:pb-0 w-full lg:w-auto">
                    <div className="flex items-center gap-2 pr-4 border-r border-zinc-800/50">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all whitespace-nowrap ${filter === 'all'
                                ? 'bg-white text-black border-white'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                                }`}
                        >
                            ALL INTEL
                        </button>
                        <button
                            onClick={() => setFilter('high-risk')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all whitespace-nowrap flex items-center gap-1.5 ${filter === 'high-risk'
                                ? 'bg-red-950/40 text-red-500 border-red-500/50'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-red-400'
                                }`}
                        >
                            <Shield className="w-3 h-3" />
                            HIGH RISK
                        </button>
                        <button
                            onClick={() => setFilter('social')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all whitespace-nowrap flex items-center gap-1.5 ${filter === 'social'
                                ? 'bg-purple-950/40 text-purple-400 border-purple-500/50'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-purple-400'
                                }`}
                        >
                            <TrendingUp className="w-3 h-3" />
                            SOCIAL
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 lg:w-64 min-w-[140px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Filter intel feed..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono placeholder:text-zinc-700"
                        />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[400px] grid-flow-dense">
                {(loading && articles.length === 0) ? (
                    // RENDER SKELETONS
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={`bg-[#050505] border border-white/5 h-full animate-pulse ${i === 0 ? 'md:col-span-2 lg:col-span-2 xl:col-span-2 row-span-2' : ''}`}>
                            <div className="h-48 bg-white/5" />
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <div className="h-3 w-20 bg-white/5 rounded" />
                                    <div className="h-3 w-12 bg-white/5 rounded" />
                                </div>
                                <div className="h-8 w-3/4 bg-white/5 rounded" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-white/5 rounded" />
                                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : visibleArticles.length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
                        <Shield className="w-12 h-12 mb-4 text-zinc-700" />
                        <span className="text-zinc-500 font-mono uppercase tracking-widest">No Intel Matches Protocol Criteria</span>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {visibleArticles.map((article, index) => {
                            const Icon = getSourceIcon(article.source, article.type);
                            const isFeatured = index === 0;
                            const isBreaking = (new Date().getTime() - new Date(article.pubDate).getTime()) < 24 * 60 * 60 * 1000;
                            const hasImage = !!article.imageUrl;

                            return (
                                <motion.article
                                    key={article.id}
                                    layout
                                    onClick={() => setSelectedArticle(article)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className={`
                                    group relative bg-[#09090b] border border-white/5 overflow-hidden cursor-pointer
                                    hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] flex flex-col h-full
                                    ${isFeatured ? 'md:col-span-2 lg:col-span-2 xl:col-span-2 row-span-2' : ''}
                                `}
                                >
                                    {/* IMAGE AREA */}
                                    <div className={`relative overflow-hidden ${isFeatured ? 'absolute inset-0 z-0' : 'h-48 border-b border-white/5'} bg-zinc-900`}>
                                        {/* Fallback Background */}
                                        <div className={`absolute inset-0 flex items-center justify-center z-0 ${isFeatured ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-black' : ''}`}>
                                            {isFeatured ? (
                                                <div className="flex flex-col items-center opacity-40 mix-blend-screen transform -rotate-12 scale-110">
                                                    <img src="/assets/logos/crosscheck-literal.png" alt="CrossCheck" className="w-96 invert saturate-0 brightness-150 contrast-125" />
                                                </div>
                                            ) : (
                                                <Shield className="w-12 h-12 text-zinc-800 opacity-50" />
                                            )}
                                        </div>

                                        {hasImage && !failedImages.has(article.id) && (
                                            <img
                                                src={article.imageUrl}
                                                alt={article.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 z-10"
                                                referrerPolicy="no-referrer"
                                                onError={(_e) => {
                                                    // Retry once with proxy logic if needed, but for now just fallback
                                                    setFailedImages(prev => new Set(prev).add(article.id));
                                                }}
                                            />
                                        )}

                                        {/* Overlays */}
                                        {isFeatured && <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />}

                                        {/* Type Badge & Video Indicator */}
                                        <div className={`absolute ${isFeatured ? 'top-4 right-4' : 'top-2 right-2'} z-30 flex flex-col items-end gap-2`}>
                                            <div className="bg-black/60 backdrop-blur border border-white/10 p-1.5 rounded shadow-lg">
                                                <Icon className={`w-3.5 h-3.5 ${article.type === 'social' ? 'text-purple-400' : 'text-emerald-400'}`} />
                                            </div>
                                            {article.videoUrl && (
                                                <div className="bg-green-950/80 backdrop-blur border border-green-500/30 px-2 py-0.5 rounded shadow-lg">
                                                    <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest">VIDEO</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Play Button Overlay */}
                                        {article.videoUrl && (
                                            <div className="absolute inset-0 z-40 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-black/50 backdrop-blur-sm p-3 rounded-full border border-white/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                                    <PlayCircle className="w-8 h-8 text-white fill-white/10" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENT AREA */}
                                    <div className={`p-5 flex-1 flex flex-col relative z-10 ${isFeatured ? 'justify-end h-full' : ''}`}>
                                        {/* Meta */}
                                        <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                                            <span className="flex items-center gap-2">
                                                <span className={isBreaking ? 'text-neon-red animate-pulse font-bold' : ''}>
                                                    {article.source}
                                                </span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeAgo(article.pubDate)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className={`font-bold text-white leading-tight mb-3 group-hover:text-purple-400 transition-colors
                                        ${isFeatured ? 'text-3xl md:text-5xl drop-shadow-lg' : 'text-base line-clamp-3'}
                                    `}>
                                            {article.title}
                                        </h3>

                                        {/* Desc */}
                                        {!isFeatured && (
                                            <p className="text-zinc-400 text-xs line-clamp-3 leading-relaxed mb-4">
                                                {article.description}
                                            </p>
                                        )}

                                        {/* Footer / Relevance */}
                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex gap-2">
                                                {article.matchedKeywords.slice(0, 2).map(k => (
                                                    <span key={k} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-400 font-mono uppercase">
                                                        {k.replace(/"/g, '')}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className={`text-[10px] font-mono font-bold ${article.relevanceScore > 80 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {article.relevanceScore}% THREAT
                                            </div>
                                        </div>

                                        {/* Related Coverage (Deduplication) */}
                                        {article.relatedStories && article.relatedStories.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-white/5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-mono">Also reported by:</span>
                                                    {article.relatedStories.slice(0, 4).map((story, idx) => (
                                                        <a
                                                            key={`${story.source}-${idx}`}
                                                            href={story.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="px-1.5 py-0.5 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 text-[10px] text-zinc-400 hover:text-white rounded uppercase tracking-tight transition-colors"
                                                            title={story.title}
                                                        >
                                                            {story.source}
                                                        </a>
                                                    ))}
                                                    {article.relatedStories.length > 4 && (
                                                        <span className="text-[9px] text-zinc-600 font-mono">+{article.relatedStories.length - 4}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.article>
                            );
                        })}
                    </AnimatePresence>)}
            </div>

            {/* Load More */}
            {filteredArticles.length > displayLimit && (
                <div className="flex justify-center py-12">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="group flex items-center gap-3 px-8 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-all"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span className="text-xs font-mono uppercase tracking-[0.2em] font-bold">Load Next 42 Entries</span>}
                    </button>
                </div>
            )}

            {/* ARTICLE DETAIL MODAL */}
            <AnimatePresence>
                {selectedArticle && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedArticle(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            layoutId={selectedArticle.id}
                            className="relative w-full max-w-4xl bg-[#0a0a0a] border border-zinc-800 shadow-2xl overflow-hidden max-h-full flex flex-col md:flex-row"
                        >
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            {/* Media Side */}
                            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800">
                                {selectedArticle.videoUrl ? (
                                    <div className="w-full h-full relative">
                                        <iframe
                                            src={getYouTubeEmbedUrl(selectedArticle.videoUrl)}
                                            className="absolute inset-0 w-full h-full"
                                            title="Video Player"
                                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : selectedArticle.imageUrl ? (
                                    <img
                                        src={selectedArticle.imageUrl}
                                        alt={selectedArticle.title}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                        <img src="/assets/logos/crosscheck-shield.png" alt="CrossCheck Shield" className="w-32 h-32 grayscale" />
                                    </div>
                                )}
                                {!selectedArticle.videoUrl && <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:bg-gradient-to-r" />}
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${selectedArticle.type === 'social' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30'}`}>
                                        {selectedArticle.source}
                                    </div>
                                    <span className="text-zinc-500 text-xs font-mono">{formatTimeAgo(selectedArticle.pubDate)}</span>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
                                    {selectedArticle.title}
                                </h2>

                                <div className="prose prose-invert prose-sm max-w-none mb-8 text-zinc-300">
                                    <p className="text-lg leading-relaxed">{selectedArticle.description}</p>
                                    <p className="text-zinc-500 italic mt-4">
                                        // A.I. Analysis: High relevance to "MN DHS Fraud" vector.
                                        Keywords matching: {selectedArticle.matchedKeywords.join(', ')}.
                                    </p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-zinc-800">
                                    <Link
                                        href={selectedArticle.link}
                                        target="_blank"
                                        className="inline-flex items-center justify-center gap-2 w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 hover:bg-zinc-200 transition-colors"
                                    >
                                        Launch Full Source Intel <ExternalLink className="w-4 h-4" />
                                    </Link>
                                    <p className="text-center text-[9px] text-zinc-600 font-mono mt-3 uppercase">
                                        External link to {selectedArticle.source}. Proceed with caution.
                                    </p>
                                </div>
                            </div>
                        </motion.div >
                    </div >
                )
                }
            </AnimatePresence >
        </div >
    );
}
