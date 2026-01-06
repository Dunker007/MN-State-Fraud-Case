"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, Building2, Network, Zap, RefreshCw, MapPin, Link2, Users } from 'lucide-react';

type PatternType = 'shell_company' | 'medical_mill' | 'ip_cluster' | 'velocity_spike' | 'address_cluster' | 'identity_chain';

interface FraudPattern {
    id: string;
    type: PatternType;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    location?: string;
    timestamp?: string;
    evidence: string[];
    riskScore: number;
}

interface FraudStats {
    totalFlaggedClaims: number;
    criticalPatterns: number;
    averageRiskScore: number;
    estimatedExposure: string;
}

const PATTERN_CONFIG: Record<PatternType, { icon: typeof AlertTriangle; label: string; color: string; bg: string; border: string }> = {
    shell_company: {
        icon: Building2,
        label: 'Shell Company',
        color: 'text-red-500',
        bg: 'bg-red-950/20',
        border: 'border-red-900/50'
    },
    medical_mill: {
        icon: AlertTriangle,
        label: 'Medical Mill',
        color: 'text-amber-500',
        bg: 'bg-amber-950/20',
        border: 'border-amber-900/50'
    },
    ip_cluster: {
        icon: Network,
        label: 'IP Cluster',
        color: 'text-purple-500',
        bg: 'bg-purple-950/20',
        border: 'border-purple-900/50'
    },
    velocity_spike: {
        icon: Zap,
        label: 'Velocity Spike',
        color: 'text-violet-500',
        bg: 'bg-violet-950/20',
        border: 'border-violet-900/50'
    },
    address_cluster: {
        icon: MapPin,
        label: 'Address Cluster',
        color: 'text-cyan-500',
        bg: 'bg-cyan-950/20',
        border: 'border-cyan-900/50'
    },
    identity_chain: {
        icon: Link2,
        label: 'Identity Chain',
        color: 'text-pink-500',
        bg: 'bg-pink-950/20',
        border: 'border-pink-900/50'
    }
};

function PatternCard({ pattern, expanded, onToggle }: { pattern: FraudPattern; expanded: boolean; onToggle: () => void }) {
    const config = PATTERN_CONFIG[pattern.type] || PATTERN_CONFIG.shell_company;
    const Icon = config.icon;

    const severityBadge = {
        low: 'bg-zinc-800 text-zinc-400',
        medium: 'bg-amber-950/50 text-amber-500',
        high: 'bg-red-950/50 text-red-400',
        critical: 'bg-red-900 text-red-200 animate-pulse'
    };

    const isCritical = pattern.severity === 'critical';
    const isHigh = pattern.severity === 'high';

    return (
        <div
            className={`${config.bg} ${config.border} border rounded-xl p-4 hover:brightness-110 transition-all relative overflow-hidden cursor-pointer ${isCritical ? 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''
                }`}
            onClick={onToggle}
        >
            {/* Urgency indicator */}
            {(isCritical || isHigh) && (
                <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full ${isCritical ? 'bg-red-500/20 animate-ping' : 'bg-amber-500/10'
                    }`} />
            )}

            <div className="flex items-start justify-between mb-3 relative">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${config.bg} ${isCritical ? 'animate-pulse' : ''}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${config.color}`}>
                        {config.label}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-500">
                        Risk: {pattern.riskScore}%
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${severityBadge[pattern.severity]}`}>
                        {pattern.severity.toUpperCase()}
                    </span>
                </div>
            </div>

            <h4 className="text-white font-bold mb-1">{pattern.title}</h4>
            <p className="text-zinc-400 text-xs mb-3 line-clamp-2">{pattern.description}</p>

            <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                    <span className={`${config.color} font-bold text-lg`}>{pattern.count}</span>
                    <span className="text-zinc-600">instances</span>
                    {pattern.location && <span className="text-zinc-600">📍 {pattern.location}</span>}
                </div>
            </div>

            {/* Expanded Evidence */}
            {expanded && pattern.evidence.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                    <p className="text-[10px] text-zinc-500 font-mono mb-2">EVIDENCE:</p>
                    <ul className="space-y-1">
                        {pattern.evidence.map((e, i) => (
                            <li key={i} className="text-[11px] text-zinc-400 flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                {e}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function FraudObservatory() {
    const [patterns, setPatterns] = useState<FraudPattern[]>([]);
    const [stats, setStats] = useState<FraudStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const fetchPatterns = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/fraud/patterns');
            if (response.ok) {
                const data = await response.json();
                setPatterns(data.patterns || []);
                setStats(data.stats || null);
                setLastUpdated(data.timestamp);
            }
        } catch (error) {
            console.error('Failed to fetch fraud patterns:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatterns();
        // Refresh every 10 minutes
        const interval = setInterval(fetchPatterns, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-mono flex items-center gap-2">
                    <span className="text-purple-500">FRAUD</span>
                    <span className="text-zinc-500">OBSERVATORY</span>
                    {patterns.filter(p => p.severity === 'critical').length > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-mono rounded animate-pulse">
                            {patterns.filter(p => p.severity === 'critical').length} CRITICAL
                        </span>
                    )}
                </h3>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPatterns}
                        disabled={loading}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            {stats && (
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-red-500">{patterns.length}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">PATTERNS</div>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-amber-500">{stats.totalFlaggedClaims.toLocaleString()}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">FLAGGED</div>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-purple-500">{stats.averageRiskScore}%</div>
                        <div className="text-[10px] text-zinc-500 font-mono">AVG RISK</div>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-red-400">{stats.estimatedExposure}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">EXPOSURE</div>
                    </div>
                </div>
            )}

            {/* Patterns Grid */}
            {loading && patterns.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 font-mono text-xs animate-pulse">
                    ANALYZING_PATTERNS...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patterns.map((pattern) => (
                        <PatternCard
                            key={pattern.id}
                            pattern={pattern}
                            expanded={expandedId === pattern.id}
                            onToggle={() => setExpandedId(expandedId === pattern.id ? null : pattern.id)}
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            {lastUpdated && (
                <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                    <span className="text-[9px] text-zinc-600 font-mono">
                        Pattern Analysis Engine v1.0
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                        Updated: {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                </div>
            )}
        </div>
    );
}
