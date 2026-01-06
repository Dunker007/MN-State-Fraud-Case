"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface SocialMention {
    id: string;
    platform: 'twitter' | 'reddit' | 'news';
    sentiment: 'positive' | 'negative' | 'neutral';
    text: string;
    author?: string;
    timestamp: string;
    url?: string;
}

interface SocialStats {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    sentimentScore: number;
}

export default function SocialPulse() {
    const [mentions, setMentions] = useState<SocialMention[]>([]);
    const [stats, setStats] = useState<SocialStats>({ total: 0, positive: 0, negative: 0, neutral: 0, sentimentScore: 50 });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [pulseIntensity, setPulseIntensity] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/social/pulse');
            if (response.ok) {
                const data = await response.json();
                setMentions(data.mentions || []);
                setStats(data.stats || { total: 0, positive: 0, negative: 0, neutral: 0, sentimentScore: 50 });
                setLastUpdated(data.timestamp);
                setPulseIntensity(100); // Flash on new data
            }
        } catch (error) {
            console.error('Failed to fetch social pulse:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Pulse animation decay
    useEffect(() => {
        const interval = setInterval(() => {
            setPulseIntensity(prev => prev > 0 ? prev - 10 : 0);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const getSentimentColor = (score: number) => {
        if (score >= 60) return 'text-green-500';
        if (score >= 40) return 'text-amber-500';
        return 'text-red-500';
    };

    const getSentimentLabel = (score: number) => {
        if (score >= 70) return 'POSITIVE';
        if (score >= 55) return 'LEANING +';
        if (score >= 45) return 'MIXED';
        if (score >= 30) return 'LEANING -';
        return 'NEGATIVE';
    };

    const getSentimentIcon = (score: number) => {
        if (score >= 55) return <TrendingUp className="w-4 h-4" />;
        if (score >= 45) return <Minus className="w-4 h-4" />;
        return <TrendingDown className="w-4 h-4" />;
    };

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'reddit': return '🔴';
            case 'twitter': return '🐦';
            case 'news': return '📰';
            default: return '💬';
        }
    };

    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 h-full flex flex-col justify-between min-h-0">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-purple-500">SOCIAL</span>_PULSE
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                        <RefreshCw className={`w-3 h-3 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div
                        className="w-2 h-2 rounded-full bg-purple-500 transition-all duration-300"
                        style={{
                            boxShadow: `0 0 ${pulseIntensity / 5}px ${pulseIntensity / 10}px rgba(168, 85, 247, 0.5)`,
                            transform: `scale(${1 + pulseIntensity / 200})`
                        }}
                    />
                    <span className="text-[10px] text-zinc-500 font-mono">
                        {mentions.length > 0 ? 'LIVE' : 'IDLE'}
                    </span>
                </div>
            </div>

            {/* Sentiment Gauge */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 font-mono">PUBLIC SENTIMENT</span>
                    <span className={`text-sm font-bold font-mono ${getSentimentColor(stats.sentimentScore)}`}>
                        {getSentimentIcon(stats.sentimentScore)}
                    </span>
                </div>
                <div className="relative h-3 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-500 to-green-500 opacity-30" />
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-lg transition-all duration-500"
                        style={{ left: `${stats.sentimentScore}%`, transform: 'translateX(-50%)' }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-mono text-zinc-600">
                    <span>NEGATIVE</span>
                    <span className={getSentimentColor(stats.sentimentScore)}>{getSentimentLabel(stats.sentimentScore)}</span>
                    <span>POSITIVE</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-green-500">{stats.positive}</div>
                    <div className="text-[10px] text-green-500/70 font-mono">POSITIVE</div>
                </div>
                <div className="bg-zinc-500/10 border border-zinc-500/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-zinc-400">{stats.neutral}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">NEUTRAL</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-red-500">{stats.negative}</div>
                    <div className="text-[10px] text-red-500/70 font-mono">NEGATIVE</div>
                </div>
            </div>

            {/* Recent Mentions */}
            <div className="space-y-2 flex-1 overflow-y-auto min-h-0 pr-2">
                {loading && mentions.length === 0 ? (
                    <div className="text-center py-4 text-zinc-500 font-mono text-xs animate-pulse">
                        SCANNING_SOCIAL_CHANNELS...
                    </div>
                ) : mentions.length === 0 ? (
                    <div className="text-center py-4 text-zinc-600 font-mono text-xs">
                        No mentions found
                    </div>
                ) : (
                    mentions.slice(0, 5).map((mention) => (
                        <a
                            key={mention.id}
                            href={mention.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block p-2 rounded-lg border text-xs transition-colors hover:opacity-80 ${mention.sentiment === 'positive'
                                    ? 'bg-green-500/5 border-green-500/20'
                                    : mention.sentiment === 'negative'
                                        ? 'bg-red-500/5 border-red-500/20'
                                        : 'bg-zinc-500/5 border-zinc-500/20'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <span className="shrink-0">{getPlatformIcon(mention.platform)}</span>
                                    <p className="text-zinc-400 line-clamp-2">{mention.text}</p>
                                </div>
                                <span className="text-[10px] text-zinc-600 shrink-0">{formatTimestamp(mention.timestamp)}</span>
                            </div>
                        </a>
                    ))
                )}
            </div>

            {/* Last Updated */}
            {lastUpdated && (
                <div className="mt-2 pt-2 border-t border-zinc-800">
                    <p className="text-[9px] text-zinc-600 font-mono text-right">
                        Updated: {new Date(lastUpdated).toLocaleTimeString()}
                    </p>
                </div>
            )}
        </div>
    );
}
