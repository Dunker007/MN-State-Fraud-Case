"use client";

import { useState, useEffect } from 'react';
import { Flame, AlertTriangle, BarChart3, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface PhoenixMatch {
    officer: string;
    dissolvedEntity: {
        name: string;
        dissolutionDate: string;
        dissolutionReason?: string;
        priorViolations?: string[];
    };
    newEntity: {
        name: string;
        filingDate: string;
        role: string;
    };
    daysBetween: number;
    phoenixScore: number;
    severity: string;
    riskFactors: string[];
}

interface PhoenixStats {
    totalMatches: number;
    criticalCount: number;
    highRiskCount: number;
    uniqueOfficers: number;
    averageScore: number;
    fastestReappearance: number;
}

export default function PhoenixDetector() {
    const [matches, setMatches] = useState<PhoenixMatch[]>([]);
    const [stats, setStats] = useState<PhoenixStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analytics/phoenix');
            if (response.ok) {
                const data = await response.json();
                setMatches(data.matches || []);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Phoenix detection failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-500/20 border-red-500/50';
            case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/50';
            case 'medium': return 'text-amber-500 bg-amber-500/20 border-amber-500/50';
            default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/50';
        }
    };

    return (
        <div className="bg-gradient-to-br from-orange-950/30 to-zinc-900 border border-orange-800/50 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-orange-800/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                Phoenix Company Detector
                                <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded font-mono">
                                    SOS INTEL
                                </span>
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-mono">
                                Fraud rebranding pattern detection
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

            {/* Stats Bar */}
            {stats && (
                <div className="grid grid-cols-4 gap-2 p-3 bg-zinc-900/50 border-b border-zinc-800">
                    <div className="text-center">
                        <div className="text-lg font-black text-orange-400">{stats.totalMatches}</div>
                        <div className="text-[9px] text-zinc-500 font-mono">MATCHES</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-black text-red-500">{stats.criticalCount}</div>
                        <div className="text-[9px] text-zinc-500 font-mono">CRITICAL</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-black text-zinc-300">{stats.uniqueOfficers}</div>
                        <div className="text-[9px] text-zinc-500 font-mono">OFFICERS</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-black text-amber-400">{stats.fastestReappearance}d</div>
                        <div className="text-[9px] text-zinc-500 font-mono">FASTEST</div>
                    </div>
                </div>
            )}

            {/* Matches List */}
            <div className="max-h-96 overflow-y-auto">
                {matches.map((match, i) => (
                    <div key={i} className="border-b border-zinc-800/50 last:border-0">
                        <button
                            onClick={() => setExpanded(expanded === match.officer ? null : match.officer)}
                            className="w-full p-3 text-left hover:bg-zinc-800/30 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase ${getSeverityColor(match.severity)}`}>
                                        {match.phoenixScore}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-white truncate">
                                            {match.officer}
                                        </div>
                                        <div className="text-[10px] text-zinc-500 truncate">
                                            {match.dissolvedEntity.name} → {match.newEntity.name}
                                        </div>
                                    </div>
                                </div>
                                {expanded === match.officer ? (
                                    <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                                )}
                            </div>
                        </button>

                        {expanded === match.officer && (
                            <div className="px-3 pb-3 space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="bg-zinc-800/50 rounded p-2">
                                        <div className="text-zinc-500 font-mono mb-1">DISSOLVED</div>
                                        <div className="text-zinc-300">{match.dissolvedEntity.name}</div>
                                        <div className="text-zinc-500">{match.dissolvedEntity.dissolutionDate}</div>
                                        {match.dissolvedEntity.dissolutionReason && (
                                            <div className="text-red-400 mt-1">
                                                Reason: {match.dissolvedEntity.dissolutionReason}
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-zinc-800/50 rounded p-2">
                                        <div className="text-zinc-500 font-mono mb-1">NEW ENTITY</div>
                                        <div className="text-zinc-300">{match.newEntity.name}</div>
                                        <div className="text-zinc-500">{match.newEntity.filingDate}</div>
                                        <div className="text-amber-400 mt-1">
                                            Role: {match.newEntity.role}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-red-900/20 border border-red-800/30 rounded p-2">
                                    <div className="text-[9px] text-red-400 font-mono mb-1">RISK FACTORS</div>
                                    <ul className="text-[10px] text-red-200/80 space-y-0.5">
                                        {match.riskFactors.map((factor, j) => (
                                            <li key={j} className="flex items-start gap-1">
                                                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                                {factor}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Loading State */}
            {loading && matches.length === 0 && (
                <div className="p-6 text-center">
                    <Flame className="w-8 h-8 text-orange-500/50 mx-auto mb-3 animate-pulse" />
                    <p className="text-zinc-500 text-sm">Scanning for phoenix patterns...</p>
                </div>
            )}

            {!loading && matches.length === 0 && (
                <div className="p-6 text-center">
                    <BarChart3 className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">No phoenix patterns detected</p>
                </div>
            )}
        </div>
    );
}
