"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Database, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';

interface CollectorStatus {
    name: string;
    endpoint: string;
    lastRun?: string;
    status: 'idle' | 'running' | 'success' | 'error';
    itemsCollected?: number;
    message?: string;
}

const COLLECTORS: CollectorStatus[] = [
    { name: 'DEED Scraper', endpoint: '/api/paid-leave/scrape', status: 'idle' },
    { name: 'Legislature', endpoint: '/api/legislature/bills', status: 'idle' },
    { name: 'Courts', endpoint: '/api/courts/search', status: 'idle' },
    { name: 'Fraud Patterns', endpoint: '/api/fraud/patterns', status: 'idle' },
    { name: 'Geo Counties', endpoint: '/api/geo/counties', status: 'idle' },
    { name: 'Social Pulse', endpoint: '/api/social/pulse', status: 'idle' },
    { name: 'News Intel', endpoint: '/api/news', status: 'idle' },
];

export default function DataCollectorPanel() {
    const [collectors, setCollectors] = useState<CollectorStatus[]>(COLLECTORS);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastFullRun, setLastFullRun] = useState<string | null>(null);

    // Load last run times from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('collector_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCollectors(prev => prev.map(c => ({
                    ...c,
                    lastRun: parsed[c.name]?.lastRun,
                    itemsCollected: parsed[c.name]?.itemsCollected
                })));
            } catch { /* ignore parse errors */ }
        }
    }, []);

    // Save state to localStorage
    const saveState = (updatedCollectors: CollectorStatus[]) => {
        const state: Record<string, { lastRun?: string; itemsCollected?: number }> = {};
        updatedCollectors.forEach(c => {
            state[c.name] = { lastRun: c.lastRun, itemsCollected: c.itemsCollected };
        });
        localStorage.setItem('collector_state', JSON.stringify(state));
    };

    const runCollector = async (name: string) => {
        const collector = collectors.find(c => c.name === name);
        if (!collector) return;

        // Set running state
        setCollectors(prev => prev.map(c =>
            c.name === name ? { ...c, status: 'running' } : c
        ));

        try {
            const response = await fetch(collector.endpoint, {
                method: collector.endpoint.includes('scrape') ? 'POST' : 'GET'
            });
            const result = await response.json();

            let itemsCollected = 0;
            let message = '';

            // Extract items count based on API response structure
            if (result.itemsCollected !== undefined) {
                itemsCollected = result.itemsCollected;
            } else if (result.count !== undefined) {
                itemsCollected = result.count;
            } else if (result.bills) {
                itemsCollected = result.bills.length;
            } else if (result.mentions) {
                itemsCollected = result.mentions.length;
            } else if (Array.isArray(result)) {
                itemsCollected = result.length;
            }

            message = result.message || (result.success ? 'Collected successfully' : 'No new data');

            const updatedCollectors = collectors.map(c =>
                c.name === name
                    ? {
                        ...c,
                        status: 'success' as const,
                        lastRun: 'Just now',
                        itemsCollected,
                        message
                    }
                    : c
            );
            setCollectors(updatedCollectors);
            saveState(updatedCollectors);

        } catch (error) {
            const updatedCollectors = collectors.map(c =>
                c.name === name
                    ? { ...c, status: 'error' as const, message: String(error) }
                    : c
            );
            setCollectors(updatedCollectors);
        }

        // Reset status after delay
        setTimeout(() => {
            setCollectors(prev => prev.map(c =>
                c.name === name ? { ...c, status: 'idle' } : c
            ));
        }, 5000);
    };

    const runAll = async () => {
        setIsRefreshing(true);
        for (const collector of collectors) {
            await runCollector(collector.name);
            // Small delay between collectors
            await new Promise(r => setTimeout(r, 500));
        }
        setLastFullRun(new Date().toLocaleTimeString());
        setIsRefreshing(false);
    };

    const getStatusIcon = (status: CollectorStatus['status']) => {
        switch (status) {
            case 'running':
                return <Loader2 className="w-3 h-3 animate-spin text-purple-500" />;
            case 'success':
                return <CheckCircle className="w-3 h-3 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-3 h-3 text-red-500" />;
            default:
                return <Database className="w-3 h-3 text-zinc-500" />;
        }
    };

    const getStatusBg = (status: CollectorStatus['status']) => {
        switch (status) {
            case 'running': return 'bg-purple-500/10 border-purple-500/30';
            case 'success': return 'bg-green-500/10 border-green-500/30';
            case 'error': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-zinc-900/50 border-zinc-800';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <span className="text-green-500">DATA</span>_COLLECTORS
                    <span className="text-[10px] text-zinc-600 font-normal">
                        {collectors.filter(c => c.status === 'running').length > 0 && '(Running...)'}
                    </span>
                </h3>
                <div className="flex items-center gap-2">
                    {lastFullRun && (
                        <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last: {lastFullRun}
                        </span>
                    )}
                    <button
                        onClick={runAll}
                        disabled={isRefreshing}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-xs font-mono text-green-400 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                        RUN ALL
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {collectors.map((collector) => (
                    <div
                        key={collector.name}
                        className={`rounded-lg p-3 border transition-colors ${getStatusBg(collector.status)}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(collector.status)}
                                <span className="text-xs font-mono text-zinc-300">{collector.name}</span>
                            </div>
                            <button
                                onClick={() => runCollector(collector.name)}
                                disabled={collector.status === 'running'}
                                className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3 h-3 ${collector.status === 'running' ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">
                                {collector.lastRun || 'Never'}
                            </span>
                            {collector.itemsCollected !== undefined && (
                                <span className="text-purple-400">
                                    {collector.itemsCollected} items
                                </span>
                            )}
                        </div>
                        {collector.message && collector.status !== 'idle' && (
                            <p className={`text-[9px] mt-1 truncate ${collector.status === 'error' ? 'text-red-400' : 'text-zinc-500'
                                }`}>
                                {collector.message}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Stats Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600">
                    <span>DEED: mn.gov/deed</span>
                    <span>Legislature: revisor.mn.gov</span>
                    <span>Social: reddit.com</span>
                    <span>News: GDELT</span>
                </div>
                <span className="text-[10px] text-green-500/70 font-mono">
                    {collectors.filter(c => c.itemsCollected && c.itemsCollected > 0).length}/{collectors.length} ACTIVE
                </span>
            </div>
        </div>
    );
}
