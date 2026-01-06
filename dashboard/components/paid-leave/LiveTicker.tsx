"use client";

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, MessageSquare, Scale, FileText, Newspaper, RefreshCw } from 'lucide-react';

interface TickerItem {
    id: string;
    type: 'fund' | 'claim' | 'fraud' | 'social' | 'court' | 'bill' | 'news';
    message: string;
    timestamp: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    source?: string;
}

async function fetchLiveData(): Promise<TickerItem[]> {
    const items: TickerItem[] = [];
    const now = new Date();

    try {
        // Fetch paid leave data
        const paidLeaveRes = await fetch('/api/paid-leave');
        if (paidLeaveRes.ok) {
            const data = await paidLeaveRes.json();
            const latestSnapshot = data.snapshots?.[0];
            if (latestSnapshot) {
                items.push({
                    id: 'fund-balance',
                    type: 'fund',
                    message: `FUND BALANCE: $${latestSnapshot.fund_balance_millions}M remaining • ${latestSnapshot.claims_approved?.toLocaleString() || 0} claims approved`,
                    timestamp: now.toISOString(),
                    severity: latestSnapshot.fund_balance_millions < 300 ? 'critical' : latestSnapshot.fund_balance_millions < 400 ? 'high' : 'medium',
                    source: 'DEED'
                });

                if (latestSnapshot.claims_received > 0) {
                    items.push({
                        id: 'claims-count',
                        type: 'claim',
                        message: `CLAIMS: ${latestSnapshot.claims_received.toLocaleString()} applications received since launch`,
                        timestamp: now.toISOString(),
                        severity: 'low',
                        source: 'DEED'
                    });
                }
            }
        }
    } catch (e) { console.log('Ticker: paid-leave fetch failed', e); }

    try {
        // Fetch court cases
        const courtsRes = await fetch('/api/courts/search');
        if (courtsRes.ok) {
            const data = await courtsRes.json();
            const latestCase = data.cases?.[0];
            if (latestCase) {
                items.push({
                    id: 'court-latest',
                    type: 'court',
                    message: `COURT: ${latestCase.title} — Status: ${latestCase.status.toUpperCase()}`,
                    timestamp: now.toISOString(),
                    severity: latestCase.status === 'Active' ? 'high' : 'medium',
                    source: 'MN Courts'
                });
            }
        }
    } catch (e) { console.log('Ticker: courts fetch failed', e); }

    try {
        // Fetch bills
        const billsRes = await fetch('/api/legislature/bills');
        if (billsRes.ok) {
            const data = await billsRes.json();
            const latestBill = data.bills?.[0];
            if (latestBill) {
                items.push({
                    id: 'bill-latest',
                    type: 'bill',
                    message: `LEGISLATURE: ${latestBill.bill_number} (${latestBill.title}) — ${latestBill.status}`,
                    timestamp: now.toISOString(),
                    severity: 'medium',
                    source: 'MN Revisor'
                });
            }
        }
    } catch (e) { console.log('Ticker: bills fetch failed', e); }

    try {
        // Fetch news
        const newsRes = await fetch('/api/news');
        if (newsRes.ok) {
            const articles = await newsRes.json();
            if (articles.length > 0) {
                const topArticle = articles[0];
                items.push({
                    id: 'news-latest',
                    type: 'news',
                    message: `INTEL: ${topArticle.title?.substring(0, 80)}...`,
                    timestamp: now.toISOString(),
                    severity: 'low',
                    source: topArticle.source?.name || 'GDELT'
                });
            }
        }
    } catch (e) { console.log('Ticker: news fetch failed', e); }

    try {
        // Fetch social pulse for sentiment
        const socialRes = await fetch('/api/social/pulse');
        if (socialRes.ok) {
            const data = await socialRes.json();
            if (data.stats && data.stats.total > 0) {
                const sentiment = data.stats.sentimentScore > 60 ? 'POSITIVE' : data.stats.sentimentScore < 40 ? 'NEGATIVE' : 'MIXED';
                items.push({
                    id: 'social-sentiment',
                    type: 'social',
                    message: `SOCIAL PULSE: ${sentiment} sentiment (${data.stats.total} mentions tracked)`,
                    timestamp: now.toISOString(),
                    severity: data.stats.sentimentScore < 40 ? 'high' : 'low',
                    source: 'Reddit'
                });
            }
        }
    } catch (e) { console.log('Ticker: social fetch failed', e); }

    // Add static fraud alert
    items.push({
        id: 'fraud-55407',
        type: 'fraud',
        message: 'ALERT: 55407 Zip Cluster flagged — 47 potential shell companies detected',
        timestamp: now.toISOString(),
        severity: 'critical',
        source: 'Pattern Analysis'
    });

    return items;
}

function getIcon(type: TickerItem['type']) {
    switch (type) {
        case 'fund':
            return <TrendingDown className="w-4 h-4" />;
        case 'claim':
            return <TrendingUp className="w-4 h-4" />;
        case 'fraud':
            return <AlertTriangle className="w-4 h-4" />;
        case 'social':
            return <MessageSquare className="w-4 h-4" />;
        case 'court':
            return <Scale className="w-4 h-4" />;
        case 'bill':
            return <FileText className="w-4 h-4" />;
        case 'news':
            return <Newspaper className="w-4 h-4" />;
        default:
            return <Activity className="w-4 h-4" />;
    }
}

function getColor(severity: TickerItem['severity']) {
    switch (severity) {
        case 'critical':
            return 'text-red-500';
        case 'high':
            return 'text-amber-500';
        case 'medium':
            return 'text-purple-500';
        case 'low':
        default:
            return 'text-zinc-400';
    }
}

export default function LiveTicker() {
    const [items, setItems] = useState<TickerItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const refresh = async () => {
        setLoading(true);
        const newItems = await fetchLiveData();
        setItems(newItems);
        setLastUpdated(new Date());
        setLoading(false);
    };

    useEffect(() => {
        refresh();
        // Refresh data every 5 minutes
        const dataInterval = setInterval(refresh, 5 * 60 * 1000);
        return () => clearInterval(dataInterval);
    }, []);

    // Rotate through items
    useEffect(() => {
        if (items.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % items.length);
        }, 5000); // 5 seconds per item

        return () => clearInterval(interval);
    }, [items.length]);

    if (items.length === 0 && !loading) return null;

    const currentItem = items[currentIndex] || { id: 'loading', type: 'fund', message: 'Loading intelligence feeds...', timestamp: '', severity: 'low' as const };

    return (
        <div className="bg-black border-y border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-2">
                {/* Live indicator */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                    <span className={`text-[10px] font-mono font-bold uppercase ${loading ? 'text-amber-500' : 'text-red-500'}`}>
                        {loading ? 'Sync' : 'Live'}
                    </span>
                </div>

                {/* Ticker content */}
                <div
                    className={`flex items-center gap-2 flex-1 ${getColor(currentItem.severity)} transition-all duration-500`}
                    key={currentItem.id}
                >
                    {getIcon(currentItem.type as TickerItem['type'])}
                    <span className="text-sm font-mono truncate">
                        {currentItem.message}
                    </span>
                    {currentItem.source && (
                        <span className="text-[9px] text-zinc-600 font-mono shrink-0">
                            [{currentItem.source}]
                        </span>
                    )}
                </div>

                {/* Refresh button */}
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="p-1 hover:bg-zinc-800 rounded transition-colors shrink-0"
                >
                    <RefreshCw className={`w-3 h-3 text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
                </button>

                {/* Progress dots */}
                <div className="flex items-center gap-1 shrink-0">
                    {items.map((_, i) => (
                        <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-purple-500' : 'bg-zinc-700'}`}
                        />
                    ))}
                </div>

                {/* Last updated */}
                {lastUpdated && (
                    <span className="text-[9px] text-zinc-700 font-mono shrink-0 hidden md:block">
                        {lastUpdated.toLocaleTimeString()}
                    </span>
                )}
            </div>
        </div>
    );
}
