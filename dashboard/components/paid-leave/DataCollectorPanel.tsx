"use client";

import { useState } from 'react';
import { RefreshCw, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CollectorStatus {
    name: string;
    lastRun?: string;
    status: 'idle' | 'running' | 'success' | 'error';
    itemsCollected?: number;
}

export default function DataCollectorPanel() {
    const [collectors, setCollectors] = useState<CollectorStatus[]>([
        { name: 'DEED', status: 'idle', lastRun: '2h ago', itemsCollected: 3 },
        { name: 'Legislature', status: 'idle', lastRun: '6h ago', itemsCollected: 12 },
        { name: 'Courts', status: 'idle', lastRun: '1d ago', itemsCollected: 2 },
        { name: 'Social', status: 'idle', lastRun: '30m ago', itemsCollected: 47 },
    ]);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const runCollector = async (name: string) => {
        setCollectors(prev => prev.map(c =>
            c.name === name ? { ...c, status: 'running' } : c
        ));

        // Simulate API call
        try {
            const response = await fetch(`/api/collect/${name.toLowerCase()}`, { method: 'POST' });
            const result = await response.json();

            setCollectors(prev => prev.map(c =>
                c.name === name
                    ? { ...c, status: 'success', lastRun: 'Just now', itemsCollected: result.itemsCollected || 0 }
                    : c
            ));
        } catch {
            setCollectors(prev => prev.map(c =>
                c.name === name ? { ...c, status: 'error' } : c
            ));
        }

        // Reset status after delay
        setTimeout(() => {
            setCollectors(prev => prev.map(c =>
                c.name === name ? { ...c, status: 'idle' } : c
            ));
        }, 3000);
    };

    const runAll = async () => {
        setIsRefreshing(true);
        for (const collector of collectors) {
            await runCollector(collector.name);
        }
        setIsRefreshing(false);
    };

    const getStatusIcon = (status: CollectorStatus['status']) => {
        switch (status) {
            case 'running':
                return <Loader2 className="w-3 h-3 animate-spin text-cyan-500" />;
            case 'success':
                return <CheckCircle className="w-3 h-3 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-3 h-3 text-red-500" />;
            default:
                return <Database className="w-3 h-3 text-zinc-500" />;
        }
    };

    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white font-mono">
                    <span className="text-green-500">DATA</span>_COLLECTORS
                </h3>
                <button
                    onClick={runAll}
                    disabled={isRefreshing}
                    className="flex items-center gap-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-[10px] font-mono text-green-400 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    RUN ALL
                </button>
            </div>

            <div className="space-y-2">
                {collectors.map((collector) => (
                    <div
                        key={collector.name}
                        className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            {getStatusIcon(collector.status)}
                            <span className="text-xs font-mono text-zinc-300">{collector.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-zinc-600 font-mono">
                                {collector.lastRun}
                            </span>
                            <button
                                onClick={() => runCollector(collector.name)}
                                disabled={collector.status === 'running'}
                                className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3 h-3 ${collector.status === 'running' ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
