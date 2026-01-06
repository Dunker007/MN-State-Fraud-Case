"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, TrendingDown, Minus, Users, Zap } from 'lucide-react';

interface SocialMention {
    id: string;
    platform: 'twitter' | 'reddit' | 'news';
    sentiment: 'positive' | 'negative' | 'neutral';
    text: string;
    timestamp: string;
}

// Simulated social mentions
const SIMULATED_MENTIONS: SocialMention[] = [
    { id: '1', platform: 'twitter', sentiment: 'negative', text: 'MN Paid Leave site crashed again...', timestamp: '2m ago' },
    { id: '2', platform: 'twitter', sentiment: 'positive', text: 'Finally got my paid leave approved!', timestamp: '5m ago' },
    { id: '3', platform: 'reddit', sentiment: 'negative', text: 'Anyone else waiting 3 weeks for DEED response?', timestamp: '12m ago' },
    { id: '4', platform: 'news', sentiment: 'neutral', text: 'DEED reports system improvements underway', timestamp: '1h ago' },
    { id: '5', platform: 'twitter', sentiment: 'negative', text: 'This program is hemorrhaging money', timestamp: '2h ago' },
];

export default function SocialPulse() {
    const [mentions, setMentions] = useState<SocialMention[]>(SIMULATED_MENTIONS);
    const [sentimentScore, setSentimentScore] = useState(42); // 0-100, 50 is neutral
    const [pulseIntensity, setPulseIntensity] = useState(0);

    // Calculate sentiment distribution
    const positive = mentions.filter(m => m.sentiment === 'positive').length;
    const negative = mentions.filter(m => m.sentiment === 'negative').length;
    const neutral = mentions.filter(m => m.sentiment === 'neutral').length;
    const total = mentions.length;

    // Pulse animation for activity
    useEffect(() => {
        const interval = setInterval(() => {
            setPulseIntensity(prev => prev > 0 ? prev - 10 : 0);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Simulate new mention arriving
    useEffect(() => {
        const interval = setInterval(() => {
            setPulseIntensity(100);
            setSentimentScore(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
        }, 15000);
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

    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 h-full flex flex-col justify-between min-h-0">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-purple-500">SOCIAL</span>_PULSE
                </h3>
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full bg-purple-500 transition-all duration-300"
                        style={{
                            boxShadow: `0 0 ${pulseIntensity / 5}px ${pulseIntensity / 10}px rgba(168, 85, 247, 0.5)`,
                            transform: `scale(${1 + pulseIntensity / 200})`
                        }}
                    />
                    <span className="text-[10px] text-zinc-500 font-mono">LIVE</span>
                </div>
            </div>

            {/* Sentiment Gauge */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 font-mono">PUBLIC SENTIMENT</span>
                    <span className={`text-sm font-bold font-mono ${getSentimentColor(sentimentScore)}`}>
                        {getSentimentIcon(sentimentScore)}
                    </span>
                </div>
                <div className="relative h-3 bg-zinc-900 rounded-full overflow-hidden">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-500 to-green-500 opacity-30" />
                    {/* Indicator */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-lg transition-all duration-500"
                        style={{ left: `${sentimentScore}%`, transform: 'translateX(-50%)' }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-mono text-zinc-600">
                    <span>NEGATIVE</span>
                    <span className={getSentimentColor(sentimentScore)}>{getSentimentLabel(sentimentScore)}</span>
                    <span>POSITIVE</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-green-500">{positive}</div>
                    <div className="text-[10px] text-green-500/70 font-mono">POSITIVE</div>
                </div>
                <div className="bg-zinc-500/10 border border-zinc-500/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-zinc-400">{neutral}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">NEUTRAL</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-red-500">{negative}</div>
                    <div className="text-[10px] text-red-500/70 font-mono">NEGATIVE</div>
                </div>
            </div>

            {/* Recent Mentions */}
            <div className="space-y-2 flex-1 overflow-y-auto min-h-0 pr-2">
                {mentions.slice(0, 3).map((mention) => (
                    <div
                        key={mention.id}
                        className={`p-2 rounded-lg border text-xs ${mention.sentiment === 'positive'
                            ? 'bg-green-500/5 border-green-500/20'
                            : mention.sentiment === 'negative'
                                ? 'bg-red-500/5 border-red-500/20'
                                : 'bg-zinc-500/5 border-zinc-500/20'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-zinc-400 line-clamp-2">{mention.text}</p>
                            <span className="text-[10px] text-zinc-600 shrink-0">{mention.timestamp}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
