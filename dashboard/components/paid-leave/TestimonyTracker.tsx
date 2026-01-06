"use client";

import { useState, useEffect } from 'react';
import { Mic2, RefreshCw, MessageSquare, User, Calendar, PlayCircle } from 'lucide-react';

interface TestimonySnippet {
    id: string;
    speaker: string;
    role: string;
    committee: string;
    date: string;
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'concerned';
    keywords: string[];
    timestamp: string;
}

export default function TestimonyTracker() {
    const [testimony, setTestimony] = useState<TestimonySnippet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/legislature/testimony');
            if (response.ok) {
                const data = await response.json();
                setTestimony(data.hearings || []);
            }
        } catch (error) {
            console.error('Testimony fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'border-l-green-500';
            case 'negative': return 'border-l-red-500';
            case 'concerned': return 'border-l-amber-500';
            default: return 'border-l-zinc-500';
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Mic2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            Hearing Monitor
                            <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded font-mono">
                                LIVE
                            </span>
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-mono">
                            Legislative testimony & transcript analysis
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

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
                {testimony.map((item) => (
                    <div key={item.id} className={`bg-zinc-950/50 border border-zinc-800 border-l-4 rounded p-3 ${getSentimentColor(item.sentiment)}`}>
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <User className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white">{item.speaker}</div>
                                    <div className="text-[10px] text-zinc-500">{item.role}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-zinc-300 italic mb-3 pl-2 border-l border-zinc-800">
                            "{item.text}"
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {item.keywords.map(k => (
                                    <span key={k} className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                                        #{k}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-red-400 cursor-pointer hover:text-red-300">
                                <PlayCircle className="w-3 h-3" />
                                {item.timestamp}
                            </div>
                        </div>

                        <div className="mt-2 text-[10px] text-zinc-600 uppercase tracking-widest">
                            {item.committee}
                        </div>
                    </div>
                ))}

                {testimony.length === 0 && !loading && (
                    <div className="text-center py-10 text-zinc-500 text-xs">
                        No recent testimony found matching monitored keywords.
                    </div>
                )}
            </div>
        </div>
    );
}
