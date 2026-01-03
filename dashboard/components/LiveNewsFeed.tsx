"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Newspaper,
    ExternalLink,
    RefreshCw,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Bookmark,
    BookmarkCheck,
    ArrowRight
} from 'lucide-react';

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
}

interface NewsResponse {
    success: boolean;
    count: number;
    totalAvailable: number;
    articles: NewsArticle[];
    lastUpdated: string;
}

export default function LiveNewsFeed() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [minScore, setMinScore] = useState(0);
    const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
    const [boardArticles, setBoardArticles] = useState<Set<string>>(new Set());
    const [hoveredArticle, setHoveredArticle] = useState<string | null>(null);

    const handleSaveArticle = (articleId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSavedArticles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(articleId)) {
                newSet.delete(articleId);
            } else {
                newSet.add(articleId);
            }
            return newSet;
        });
    };

    const handleMoveToBoard = (article: NewsArticle, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setBoardArticles(prev => new Set(prev).add(article.id));
        // In production, this would call an API to add to investigation board
        console.log('Added to investigation board:', article.title);
    };

    const fetchNews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/news?type=news&minScore=${minScore}&limit=15`);
            const data: NewsResponse = await response.json();
            if (data.success) {
                setArticles(data.articles);
                setLastUpdated(new Date(data.lastUpdated));
            } else {
                setError('Failed to fetch news');
            }
        } catch (err) {
            setError('News temporarily unavailable — check Alpha News directly');
            console.error('News fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [minScore]);

    useEffect(() => {
        fetchNews();
        // Refresh every 15 minutes
        const interval = setInterval(fetchNews, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchNews]);

    const formatTimeAgo = (date: string) => {
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

    const getRelevanceBadge = (score: number) => {
        if (score >= 15) return { label: 'CRITICAL', color: 'bg-neon-red text-white' };
        if (score >= 10) return { label: 'HIGH', color: 'bg-amber-600 text-white' };
        if (score >= 5) return { label: 'MEDIUM', color: 'bg-yellow-600 text-black' };
        return null;
    };

    const highRelevanceCount = articles.filter(a => a.relevanceScore >= 10).length;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Newspaper className="w-6 h-6 text-blue-500" />
                        {highRelevanceCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-red rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse">
                                {highRelevanceCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white font-mono">LIVE_INTEL_FEED</h2>
                        <p className="text-xs text-zinc-500 font-mono">
                            Auto-tracking Alpha News, Star Tribune, MPR, DOJ
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Filter */}
                    <select
                        value={minScore}
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 font-mono"
                    >
                        <option value={0}>All News</option>
                        <option value={5}>Medium+ Relevance</option>
                        <option value={10}>High+ Relevance</option>
                        <option value={15}>Critical Only</option>
                    </select>

                    {/* Refresh button */}
                    <button
                        onClick={fetchNews}
                        disabled={loading}
                        className="p-2 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Expand/Collapse */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Last updated */}
            {lastUpdated && (
                <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono mb-3">
                    <Clock className="w-3 h-3" />
                    Updated: {formatTimeAgo(lastUpdated.toISOString())}
                    <span className="text-zinc-700">•</span>
                    <span>{articles.length} articles</span>
                </div>
            )}

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {error && (
                            <div className="bg-red-950/30 border border-red-900/50 p-4 rounded flex items-center gap-3 mb-4">
                                <AlertTriangle className="w-5 h-5 text-neon-red" />
                                <span className="text-red-200 text-sm">{error}</span>
                                <button
                                    onClick={fetchNews}
                                    className="ml-auto text-xs text-red-400 hover:text-white"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {loading && articles.length === 0 ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded animate-pulse">
                                        <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-zinc-800 rounded w-1/4" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2 h-[500px] overflow-y-auto pr-2">
                                {articles.map((article, index) => {
                                    const badge = getRelevanceBadge(article.relevanceScore);

                                    return (
                                        <motion.a
                                            key={article.id}
                                            href={article.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="block bg-zinc-900/50 border border-zinc-800 p-3 rounded hover:border-zinc-600 hover:bg-zinc-900 transition-all group relative overflow-hidden"
                                            onMouseEnter={() => setHoveredArticle(article.id)}
                                            onMouseLeave={() => setHoveredArticle(null)}
                                        >
                                            {/* Refined Card Content */}
                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Source Line */}
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider bg-zinc-800/50 px-1.5 py-0.5 rounded">
                                                                {article.source}
                                                            </span>
                                                            <span className="text-zinc-600">•</span>
                                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                                {formatTimeAgo(article.pubDate)}
                                                            </span>
                                                            {badge && (
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ml-auto ${badge.color}`}>
                                                                    {badge.label}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="text-sm text-zinc-200 font-medium leading-snug group-hover:text-blue-400 transition-colors mb-2">
                                                            {article.title}
                                                        </h3>

                                                        {/* Matched Keywords - Small Tags */}
                                                        {article.matchedKeywords.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mb-1">
                                                                {article.matchedKeywords.slice(0, 4).map((kw, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="text-[9px] px-1.5 py-0.5 bg-blue-950/30 text-blue-300 rounded border border-blue-900/30 font-mono uppercase tracking-tight"
                                                                    >
                                                                        {kw}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-1 flex-shrink-0 ml-1">
                                                        <button
                                                            onClick={(e) => handleSaveArticle(article.id, e)}
                                                            className={`p-1.5 rounded transition-colors ${savedArticles.has(article.id)
                                                                ? 'bg-amber-950/50 text-amber-400'
                                                                : 'bg-zinc-800/30 text-zinc-600 hover:bg-zinc-800 hover:text-amber-400'
                                                                }`}
                                                        >
                                                            {savedArticles.has(article.id) ? (
                                                                <BookmarkCheck className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <Bookmark className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleMoveToBoard(article, e)}
                                                            disabled={boardArticles.has(article.id)}
                                                            className={`p-1.5 rounded transition-colors ${boardArticles.has(article.id)
                                                                ? 'bg-green-950/50 text-green-400'
                                                                : 'bg-zinc-800/30 text-zinc-600 hover:bg-zinc-800 hover:text-cyan-400'
                                                                }`}
                                                        >
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Snippet Overlay */}
                                            {hoveredArticle === article.id && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm z-20 flex flex-col justify-center p-4 rounded border border-zinc-800"
                                                >
                                                    <p className="text-zinc-400 text-xs mb-3 line-clamp-4 leading-relaxed font-mono">
                                                        {article.description || "No description available for this intel item."}
                                                    </p>
                                                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-zinc-800">
                                                        <span className="text-[10px] text-zinc-600">
                                                            Detected via Newscatcher V3
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-blue-400 font-bold group-hover:underline">
                                                                Access Source
                                                            </span>
                                                            <ExternalLink className="w-3 h-3 text-blue-400" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.a>
                                    );
                                })}

                                {articles.length === 0 && !loading && (
                                    <div className="text-center py-8 text-zinc-500">
                                        <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p>No matching articles found</p>
                                        <p className="text-xs mt-1">Try lowering the relevance filter</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section >
    );
}
