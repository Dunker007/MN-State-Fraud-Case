"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Youtube, MessageCircle, TrendingUp, ExternalLink, Clock, Bookmark, BookmarkCheck, ArrowRight, AlertTriangle } from 'lucide-react';

interface NewsArticle {
    id: string;
    title: string;
    description: string;
    link: string;
    pubDate: string;
    source: string;
    sourceId: string;
    author?: string;
    imageUrl?: string;
    matchedKeywords: string[];
    relevanceScore: number;
    type?: string;
}

interface NewsResponse {
    success: boolean;
    count: number;
    totalAvailable: number;
    articles: NewsArticle[];
    lastUpdated: string;
}

export default function SocialMediaFeed() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'twitter' | 'youtube' | 'reddit'>('all');
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    const [boardPosts, setBoardPosts] = useState<Set<string>>(new Set());
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchSocialIntel = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/news?type=social&limit=20');
            const data: NewsResponse = await response.json();
            if (data.success) {
                setArticles(data.articles);
                setLastUpdated(new Date(data.lastUpdated));
            } else {
                setError('Failed to fetch social intel');
            }
        } catch (err) {
            console.error('Social intel fetch error:', err);
            setError('Stream unavailable');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSocialIntel();
        const interval = setInterval(fetchSocialIntel, 60 * 1000); // Poll every minute
        return () => clearInterval(interval);
    }, [fetchSocialIntel]);

    const handleSavePost = (postId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSavedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) { newSet.delete(postId); }
            else { newSet.add(postId); }
            return newSet;
        });
    };

    const handleMoveToBoard = (article: NewsArticle, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setBoardPosts(prev => new Set(prev).add(article.id));
    };

    const getIcon = (source: string) => {
        const s = source.toLowerCase();
        if (s.includes('youtube')) return Youtube;
        if (s.includes('twitter') || s.includes('x.com')) return Twitter;
        if (s.includes('reddit')) return MessageCircle;
        return TrendingUp;
    };

    const getColor = (source: string) => {
        const s = source.toLowerCase();
        if (s.includes('youtube')) return 'text-red-500';
        if (s.includes('twitter') || s.includes('x.com')) return 'text-sky-400';
        if (s.includes('reddit')) return 'text-orange-500';
        return 'text-purple-500';
    };

    const filteredArticles = filter === 'all'
        ? articles
        : articles.filter(a => a.source.toLowerCase().includes(filter));

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return 'Just now';
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                    <div>
                        <h2 className="text-xl font-bold text-white font-mono">SOCIAL_INTEL_FEED</h2>
                        <p className="text-xs text-zinc-500 font-mono">
                            Tracking Twitter, YouTube, Reddit
                        </p>
                    </div>
                </div>

                {/* Platform Filter */}
                <div className="flex gap-2">
                    {['all', 'twitter', 'youtube', 'reddit'].map((f) => {
                        const Icon = getIcon(f);
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-3 py-1 text-xs font-mono rounded transition-colors uppercase ${filter === f
                                    ? 'bg-purple-950/50 text-purple-400 border border-purple-900'
                                    : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {f === 'all' ? 'ALL' : <Icon className="w-3 h-3" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Status Line */}
            <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono mb-3">
                <Clock className="w-3 h-3" />
                Monitoring active
                <span className="text-zinc-700">•</span>
                <span>Real-time stream</span>
                {lastUpdated && <span className="ml-auto">Synced: {lastUpdated.toLocaleTimeString()}</span>}
            </div>

            {/* Content */}
            <div className="space-y-2 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {loading && articles.length === 0 ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded animate-pulse h-24" />
                        ))}
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredArticles.map((article, index) => {
                            const Icon = getIcon(article.source);
                            const colorClass = getColor(article.source);

                            return (
                                <motion.a
                                    key={article.id}
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="block bg-zinc-900/50 border border-zinc-800 p-3 rounded hover:border-zinc-600 hover:bg-zinc-900 transition-all group relative"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Top Line */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon className={`w-4 h-4 ${colorClass}`} />
                                                <span className="text-xs text-white font-bold truncate">
                                                    {article.author || article.source}
                                                </span>
                                                <span className="text-zinc-700">•</span>
                                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                    {formatTimeAgo(article.pubDate)}
                                                </span>
                                                {/* Keyword Tags */}
                                                {article.matchedKeywords.length > 0 && (
                                                    <div className="flex gap-1 ml-2">
                                                        {article.matchedKeywords.slice(0, 2).map((kw, i) => (
                                                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-tighter">
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Title/Content */}
                                            <p className="text-sm text-zinc-300 leading-snug group-hover:text-white transition-colors line-clamp-2">
                                                {article.title}
                                            </p>

                                            {/* Description Snippet (Hover Only) */}
                                            <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <p className="text-xs text-zinc-500 mt-2 pl-2 border-l-2 border-zinc-700 italic line-clamp-2">
                                                    {article.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleSavePost(article.id, e)}
                                                className={`p-1.5 rounded transition-colors ${savedPosts.has(article.id)
                                                    ? 'bg-amber-950/50 text-amber-400'
                                                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-amber-400'
                                                    }`}
                                            >
                                                {savedPosts.has(article.id) ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                                            </button>
                                            <button
                                                onClick={(e) => handleMoveToBoard(article, e)}
                                                disabled={boardPosts.has(article.id)}
                                                className={`p-1.5 rounded transition-colors ${boardPosts.has(article.id)
                                                    ? 'bg-green-950/50 text-green-400'
                                                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-cyan-400'
                                                    }`}
                                            >
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 hover:text-purple-400 ml-1" />
                                        </div>
                                    </div>
                                </motion.a>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </motion.section>
    );
}
