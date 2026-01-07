"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    ExternalLink,
    Camera,
    TrendingUp,
    Calendar,
    Loader2,
    ChevronDown,
    ChevronUp,
    Archive,
    Newspaper
} from 'lucide-react';

interface SiteCheck {
    timestamp: string;
    date: string;
    time: string;
    status: 'up' | 'down' | 'degraded' | 'blocked';
    http_status?: number;
    excuse_type?: string;
    excuse_text?: string;
    response_time_ms?: number;
}

interface WaybackSnapshot {
    timestamp: string;
    status_code: string;
    archived_url: string;
    date_formatted: string;
}

interface MonitorStatus {
    current_status: string;
    last_check: string;
    issues_last_24h: number;
    total_incidents: number;
    excuse_frequency: Record<string, number>;
}

export default function ExcuseTracker() {
    const [status, setStatus] = useState<MonitorStatus | null>(null);
    const [recentIncidents, setRecentIncidents] = useState<SiteCheck[]>([]);
    const [historicalData, setHistoricalData] = useState<{
        snapshots_by_year: Record<string, number>;
        historical_issues: WaybackSnapshot[];
        recent_snapshots: WaybackSnapshot[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [correlationData, setCorrelationData] = useState<{
        average_score: number;
        high_count: number;
        summary: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const [statusRes, recentRes] = await Promise.all([
                fetch('/api/dhs-monitor?action=status'),
                fetch('/api/dhs-monitor?action=recent')
            ]);

            const statusData = await statusRes.json();
            const recentData = await recentRes.json();

            if (statusData.success) setStatus(statusData);
            if (recentData.success) setRecentIncidents(recentData.incidents || []);

        } catch (err) {
            setError('Failed to load monitor data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchHistorical = async () => {
        try {
            const res = await fetch('/api/dhs-monitor?action=wayback');
            const data = await res.json();
            if (data.success) {
                setHistoricalData({
                    snapshots_by_year: data.snapshots_by_year,
                    historical_issues: data.historical_issues,
                    recent_snapshots: data.recent_snapshots
                });
            }
        } catch {
            // Silently fail - historical is optional
        }
    };

    const runCheck = async () => {
        setIsChecking(true);
        try {
            const res = await fetch('/api/dhs-monitor?action=check');
            const data = await res.json();

            if (data.success) {
                // Refresh status after check
                await fetchStatus();
            }
        } catch (err) {
            setError('Check failed');
        } finally {
            setIsChecking(false);
        }
    };

    const runCorrelation = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/news-correlation?action=analyze');
            const data = await res.json();

            if (data.success) {
                setCorrelationData({
                    average_score: data.average_correlation_score,
                    high_count: data.high_correlation_count,
                    summary: data.summary
                });
            }
        } catch {
            setError('Correlation analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchHistorical();
    }, [fetchStatus]);

    const getStatusIcon = (statusType: string) => {
        switch (statusType) {
            case 'up': return <CheckCircle className="h-5 w-5 text-emerald-400" />;
            case 'down': return <XCircle className="h-5 w-5 text-red-400" />;
            case 'degraded':
            case 'blocked':
                return <AlertTriangle className="h-5 w-5 text-amber-400" />;
            default: return <Clock className="h-5 w-5 text-slate-400" />;
        }
    };

    const getStatusColor = (statusType: string) => {
        switch (statusType) {
            case 'up': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
            case 'down': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'degraded':
            case 'blocked':
                return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
        }
    };

    const excuseLabels: Record<string, string> = {
        // Security/Bot blocks
        'CAPTCHA_BLOCK': '🤖 "Bot Detection"',
        'BOT_DETECTION': '🕵️ "Suspicious Activity"',
        'MALICIOUS_CLAIM': '⚠️ "Malicious Behavior"',
        'CAPTCHA_CHALLENGE': '🔐 "CAPTCHA Required"',
        'RADWARE_SECURITY': '🛡️ "Security Block"',
        'ACCESS_DENIED': '🚫 "Access Denied"',
        'RATE_LIMITED': '⏱️ "Rate Limited"',

        // Systems Issues - The bureaucratic classics
        'SYSTEMS_ISSUE': '🔧 "Systems Issue"',
        'DOCUMENTS_NOT_POSTING': '📄 "Documents Not Posting"',
        'MNIT_BLAME': '👉 "Working with MNIT"',
        'PAPER_FALLBACK': '✉️ "Mailing Hard Copies"',
        'TEMPORARY_NOTICE': '⏳ "Temporary Notice"',

        // Maintenance/Errors
        'MAINTENANCE': '🔧 "Maintenance"',
        'TEMP_UNAVAILABLE': '⏸️ "Temporarily Unavailable"',
        'GENERIC_ERROR': '❓ "Error Occurred"',
        'TRY_LATER': '🔄 "Try Again Later"',
        'SERVICE_UNAVAILABLE': '❌ "Service Unavailable"',
        'TECHNICAL_DIFFICULTIES': '⚙️ "Technical Difficulties"',
        'SCHEDULED_DOWNTIME': '📅 "Scheduled Downtime"',

        // HTTP Errors
        'SERVER_ERROR_500': '💥 "500 Error"',
        'SERVICE_UNAVAILABLE_503': '🚫 "503 Error"',
        'NOT_FOUND_404': '🔍 "404 Not Found"',
        'BAD_GATEWAY_502': '🌐 "502 Bad Gateway"',
        'HTTP_503': '🚫 "503 Error"',
        'HTTP_500': '💥 "500 Error"',
        'HTTP_302': '↪️ "Redirect"',

        // Data issues
        'DATA_UNAVAILABLE': '📊 "Data Unavailable"',
        'RECORDS_UNAVAILABLE': '📁 "Records Unavailable"',
        'INFORMATION_DELAYED': '⏰ "Information Delayed"',
        'UPDATE_IN_PROGRESS': '🔄 "Update In Progress"',

        // Catch-all
        'BANNER_NOTICE': '📢 "Site Notice"',
        'TIMEOUT': '⏱️ "Timeout"',
        'FETCH_ERROR': '🌐 "Connection Error"',
        'MANUAL_REPORT': '✍️ "Manual Report"',
    };

    if (isLoading) {
        return (
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-700/50 p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-700/50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Camera className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tight text-white">DHS Excuse Tracker</h2>
                        <p className="text-xs font-mono text-zinc-500">
                            Documenting &quot;technical difficulties&quot; patterns
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={runCheck}
                        disabled={isChecking}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 
                                 rounded-lg flex items-center gap-2 text-white text-sm 
                                 font-medium transition-colors"
                    >
                        {isChecking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Check Now
                    </button>
                    <button
                        onClick={runCorrelation}
                        disabled={isAnalyzing}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 
                                 rounded-lg flex items-center gap-2 text-white text-sm 
                                 font-medium transition-colors"
                        title="Analyze incidents vs. news coverage"
                    >
                        {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Newspaper className="h-4 w-4" />
                        )}
                        Find Patterns
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Compact Status Row */}
            {status && (
                <div className="flex flex-wrap items-center gap-6 mb-6 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded border ${getStatusColor(status.current_status)}`}>
                        {getStatusIcon(status.current_status)}
                        <span className="text-sm font-bold uppercase">{status.current_status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-mono">{status.last_check ? new Date(status.last_check).toLocaleTimeString() : 'Never'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-mono text-zinc-400">24h:</span>
                        <span className="text-sm font-bold text-amber-400">{status.issues_last_24h}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-red-500" />
                        <span className="text-xs font-mono text-zinc-400">Total:</span>
                        <span className="text-sm font-bold text-red-400">{status.total_incidents}</span>
                    </div>
                </div>
            )}

            {/* Excuse Frequency */}
            {status && Object.keys(status.excuse_frequency).length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-mono text-zinc-400 uppercase mb-3">
                        Excuse Frequency
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(status.excuse_frequency)
                            .sort((a, b) => b[1] - a[1])
                            .map(([excuse, count]) => (
                                <div
                                    key={excuse}
                                    className="px-3 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700 
                                             text-sm flex items-center gap-2"
                                >
                                    <span className="text-zinc-300">
                                        {excuseLabels[excuse] || excuse}
                                    </span>
                                    <span className="text-amber-400 font-bold">{count}×</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Recent Incidents */}
            {recentIncidents.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-mono text-zinc-400 uppercase mb-3">
                        Recent Incidents
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {recentIncidents.map((incident, idx) => (
                            <motion.div
                                key={incident.timestamp}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-3 bg-zinc-800/50 
                                         border border-zinc-700/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(incident.status)}
                                    <div>
                                        <div className="text-white font-medium">
                                            {excuseLabels[incident.excuse_type || ''] || incident.excuse_type || 'Unknown Issue'}
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            {incident.date} at {incident.time}
                                            {incident.response_time_ms && ` • ${incident.response_time_ms}ms`}
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-mono ${getStatusColor(incident.status)}`}>
                                    {incident.status}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Wayback Machine History */}
            <div>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-sm font-mono text-blue-400 
                             hover:text-blue-300 transition-colors mb-3"
                >
                    <Archive className="h-4 w-4" />
                    Historical Record (Wayback Machine)
                    {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <AnimatePresence>
                    {showHistory && historicalData && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            {/* Snapshots by Year */}
                            <div className="mb-4">
                                <h4 className="text-xs font-mono text-zinc-500 mb-2">Archive Coverage by Year</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(historicalData.snapshots_by_year)
                                        .sort((a, b) => b[0].localeCompare(a[0]))
                                        .map(([year, count]) => (
                                            <div
                                                key={year}
                                                className="px-2 py-1 bg-zinc-800 rounded text-xs"
                                            >
                                                <span className="text-zinc-400">{year}:</span>
                                                <span className="text-white ml-1">{count}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Historical Issues */}
                            {historicalData.historical_issues.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-mono text-red-400 mb-2">
                                        Historical Issues Found ({historicalData.historical_issues.length})
                                    </h4>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {historicalData.historical_issues.slice(0, 10).map((issue, idx) => (
                                            <a
                                                key={idx}
                                                href={issue.archived_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-2 bg-red-500/5 
                                                         border border-red-500/20 rounded hover:bg-red-500/10 
                                                         transition-colors text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-400 font-mono">
                                                        HTTP {issue.status_code}
                                                    </span>
                                                    <span className="text-zinc-400">
                                                        {issue.date_formatted}
                                                    </span>
                                                </div>
                                                <ExternalLink className="h-3 w-3 text-zinc-500" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Archived Snapshots */}
                            <div>
                                <h4 className="text-xs font-mono text-zinc-500 mb-2">Recent Archives</h4>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {historicalData.recent_snapshots.slice(0, 5).map((snapshot, idx) => (
                                        <a
                                            key={idx}
                                            href={snapshot.archived_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-2 bg-zinc-800/50 
                                                     rounded hover:bg-zinc-700/50 transition-colors text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-zinc-500" />
                                                <span className="text-zinc-300">
                                                    {snapshot.date_formatted}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${snapshot.status_code === '200'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {snapshot.status_code}
                                                </span>
                                            </div>
                                            <ExternalLink className="h-3 w-3 text-zinc-500" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-700/50 text-xs text-zinc-500">
                <p>
                    Tracking DHS site availability since monitoring began.
                    Historical data from Wayback Machine archives dating back to 2007.
                </p>
            </div>
        </div>
    );
}
