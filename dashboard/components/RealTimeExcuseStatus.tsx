'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Clock, Activity, Wifi, WifiOff } from 'lucide-react';

interface ExcuseLogEntry {
    timestamp: string;
    status: 'blocked' | 'success' | 'error';
    excuse_type?: string;
    message?: string;
    url?: string;
}

interface ExcuseLog {
    last_check: string;
    total_checks: number;
    incidents: ExcuseLogEntry[];
}

export default function RealTimeExcuseStatus() {
    const [excuseLog, setExcuseLog] = useState<ExcuseLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchExcuseLog() {
            try {
                const response = await fetch('/api/excuse-log');
                if (!response.ok) throw new Error('Failed to load excuse log');
                const data = await response.json();
                setExcuseLog(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchExcuseLog();
        // Poll every 30 seconds
        const interval = setInterval(fetchExcuseLog, 30000);
        return () => clearInterval(interval);
    }, []);

    // Calculate stats from incidents
    const stats = excuseLog?.incidents?.reduce((acc, incident) => {
        if (incident.excuse_type === 'CAPTCHA_BLOCK') acc.captcha++;
        else if (incident.excuse_type === 'SYSTEMS_ISSUE') acc.systems++;
        else if (incident.status === 'success') acc.success++;
        return acc;
    }, { captcha: 0, systems: 0, success: 0 }) || { captcha: 0, systems: 0, success: 0 };

    const formatTimestamp = (ts: string) => {
        try {
            const date = new Date(ts);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return ts;
        }
    };

    const getTimeSince = (ts: string) => {
        try {
            const now = new Date();
            const then = new Date(ts);
            const diffMs = now.getTime() - then.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h ago`;
            if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m ago`;
            return `${diffMins}m ago`;
        } catch {
            return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4" />
                <div className="h-20 bg-zinc-800 rounded" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6">
                <div className="flex items-center gap-2 text-red-400">
                    <WifiOff className="w-5 h-5" />
                    <span className="font-bold">Connection Error</span>
                </div>
                <p className="text-sm text-red-400/70 mt-2">{error}</p>
            </div>
        );
    }

    const hasRecentIncident = stats.captcha > 0 || stats.systems > 0;
    const statusColor = hasRecentIncident ? 'red' : 'green';

    return (
        <div className={`bg-zinc-900/50 border rounded-xl p-6 ${hasRecentIncident ? 'border-red-900/50' : 'border-zinc-800'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${hasRecentIncident ? 'bg-red-500/20' : 'bg-green-500/20'
                        }`}>
                        {hasRecentIncident ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        ) : (
                            <Shield className="w-5 h-5 text-green-500" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">
                            DHS System Status
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-mono">
                            Real-time monitoring • Auto-refresh 30s
                        </p>
                    </div>
                </div>

                {/* Live indicator */}
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${hasRecentIncident ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                    <span className={`text-xs font-mono font-bold ${hasRecentIncident ? 'text-red-400' : 'text-green-400'
                        }`}>
                        {hasRecentIncident ? 'BLOCKED' : 'OPERATIONAL'}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-red-950/30 border border-red-900/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-red-500">{stats.captcha}</div>
                    <div className="text-[10px] font-mono text-red-400/70 uppercase">CAPTCHA</div>
                </div>
                <div className="bg-amber-950/30 border border-amber-900/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-amber-500">{stats.systems}</div>
                    <div className="text-[10px] font-mono text-amber-400/70 uppercase">SYS_ERR</div>
                </div>
                <div className="bg-green-950/30 border border-green-900/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-green-500">{stats.success}</div>
                    <div className="text-[10px] font-mono text-green-400/70 uppercase">SUCCESS</div>
                </div>
            </div>

            {/* Last Check */}
            {excuseLog?.last_check && (
                <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800 pt-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Last checked: {formatTimestamp(excuseLog.last_check)}</span>
                    </div>
                    <span className="font-mono text-zinc-600">
                        {getTimeSince(excuseLog.last_check)}
                    </span>
                </div>
            )}

            {/* Total checks badge */}
            <div className="mt-3 flex items-center justify-center">
                <div className="px-3 py-1 bg-zinc-800/50 rounded-full text-[10px] font-mono text-zinc-500">
                    <Activity className="w-3 h-3 inline mr-1" />
                    {excuseLog?.total_checks || 0} total monitoring events
                </div>
            </div>
        </div>
    );
}
