"use client";

import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Minus, RefreshCw, AlertCircle, Activity } from 'lucide-react';

interface SentimentData {
    alertLevel: 'normal' | 'elevated' | 'critical';
    analysis: {
        currentTone: number;
        toneInterpretation: string;
        trendDirection: 'positive' | 'negative' | 'stable';
        trendStrength: number;
        volatilityScore: number;
        volatilityInterpretation: string;
    };
    anomalies: {
        type: string;
        date: string;
        severity: string;
        description: string;
        recommendation: string;
    }[];
    insights: string[];
    history: {
        date: string;
        articles: number;
        averageTone: number;
    }[];
}

export default function SentimentPanel() {
    const [data, setData] = useState<SentimentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analytics/sentiment');
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Sentiment fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (direction: string) => {
        switch (direction) {
            case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'negative': return <TrendingDown className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-zinc-500" />;
        }
    };

    const getAlertColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-400';
            case 'elevated': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
            default: return 'bg-green-500/20 border-green-500/50 text-green-400';
        }
    };

    const getToneColor = (tone: number) => {
        if (tone > 2) return 'text-green-400';
        if (tone > -2) return 'text-zinc-300';
        return 'text-red-400';
    };

    return (
        <div className="bg-gradient-to-br from-blue-950/30 to-zinc-900 border border-blue-800/50 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-blue-800/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                Sentiment Monitor
                                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-mono">
                                    GDELT
                                </span>
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-mono">
                                Media tone & anomaly detection
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {data && (
                <>
                    {/* Alert Status */}
                    <div className={`mx-3 mt-3 px-3 py-2 rounded-lg border ${getAlertColor(data.alertLevel)}`}>
                        <div className="flex items-center gap-2 text-sm font-bold">
                            {data.alertLevel === 'critical' && <AlertCircle className="w-4 h-4" />}
                            {data.alertLevel.toUpperCase()} ALERT
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
                        <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
                            <div className={`text-2xl font-black ${getToneColor(data.analysis.currentTone)}`}>
                                {data.analysis.currentTone > 0 ? '+' : ''}{data.analysis.currentTone}
                            </div>
                            <div className="text-[9px] text-zinc-500 font-mono">TONE</div>
                            <div className="text-[10px] text-zinc-400 mt-1">{data.analysis.toneInterpretation}</div>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                                {getTrendIcon(data.analysis.trendDirection)}
                                <span className="text-xl font-bold text-white">{data.analysis.trendStrength}%</span>
                            </div>
                            <div className="text-[9px] text-zinc-500 font-mono">TREND</div>
                            <div className="text-[10px] text-zinc-400 mt-1 capitalize">{data.analysis.trendDirection}</div>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-amber-400">{data.analysis.volatilityScore}</div>
                            <div className="text-[9px] text-zinc-500 font-mono">VOLATILITY</div>
                            <div className="text-[10px] text-zinc-400 mt-1 truncate">{data.analysis.volatilityInterpretation}</div>
                        </div>
                    </div>

                    {/* Mini Chart */}
                    <div className="px-3 pb-3">
                        <div className="bg-zinc-900/50 rounded-lg p-3">
                            <div className="text-[9px] text-zinc-500 font-mono mb-2">7-DAY TONE HISTORY</div>
                            <div className="h-16 flex items-end gap-1">
                                {data.history.slice(0, 7).reverse().map((day, i) => {
                                    const normalized = (day.averageTone + 10) / 20; // Normalize -10 to +10 → 0 to 1
                                    const height = Math.max(10, normalized * 100);
                                    const isNegative = day.averageTone < 0;
                                    return (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-t transition-all ${isNegative ? 'bg-red-500/50' : 'bg-green-500/50'}`}
                                            style={{ height: `${height}%` }}
                                            title={`${day.date}: ${day.averageTone.toFixed(1)} (${day.articles} articles)`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Anomalies */}
                    {data.anomalies.length > 0 && (
                        <div className="px-3 pb-3">
                            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                                <div className="text-[9px] text-red-400 font-mono mb-2">
                                    {data.anomalies.length} ANOMALY DETECTED
                                </div>
                                {data.anomalies.slice(0, 2).map((a, i) => (
                                    <div key={i} className="text-[10px] text-red-200/80 mb-1">
                                        <span className="font-bold">{a.date}:</span> {a.description}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Insights */}
                    <div className="px-3 pb-3 space-y-1">
                        {data.insights.map((insight, i) => (
                            <div key={i} className="text-[10px] text-zinc-400 bg-zinc-800/30 rounded px-2 py-1">
                                {insight}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {loading && !data && (
                <div className="p-6 text-center">
                    <Activity className="w-8 h-8 text-blue-500/50 mx-auto mb-3 animate-pulse" />
                    <p className="text-zinc-500 text-sm">Analyzing sentiment...</p>
                </div>
            )}
        </div>
    );
}
