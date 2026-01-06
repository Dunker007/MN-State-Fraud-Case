"use client";

import { AlertTriangle, Building2, Network, Zap } from 'lucide-react';

type PatternType = 'shell_company' | 'medical_mill' | 'ip_cluster' | 'velocity_spike';

const PATTERN_CONFIG = {
    shell_company: {
        icon: Building2,
        label: 'Shell Company Detection',
        color: 'text-red-500',
        bg: 'bg-red-950/20',
        border: 'border-red-900/50'
    },
    medical_mill: {
        icon: AlertTriangle,
        label: 'Medical Mill Activity',
        color: 'text-amber-500',
        bg: 'bg-amber-950/20',
        border: 'border-amber-900/50'
    },
    ip_cluster: {
        icon: Network,
        label: 'IP Cluster Anomaly',
        color: 'text-purple-500',
        bg: 'bg-purple-950/20',
        border: 'border-purple-900/50'
    },
    velocity_spike: {
        icon: Zap,
        label: 'Velocity Spike',
        color: 'text-cyan-500',
        bg: 'bg-cyan-950/20',
        border: 'border-cyan-900/50'
    }
};

interface FraudPatternCardProps {
    type: PatternType;
    title: string;
    description: string;
    count: number;
    location?: string;
    timestamp?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function FraudPatternCard({
    type,
    title,
    description,
    count,
    location,
    timestamp,
    severity
}: FraudPatternCardProps) {
    const config = PATTERN_CONFIG[type];
    const Icon = config.icon;

    const severityBadge = {
        low: 'bg-zinc-800 text-zinc-400',
        medium: 'bg-amber-950/50 text-amber-500',
        high: 'bg-red-950/50 text-red-400',
        critical: 'bg-red-900 text-red-200 animate-pulse'
    };

    return (
        <div className={`${config.bg} ${config.border} border rounded-xl p-4 hover:brightness-110 transition-all`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    <span className={`text-xs font-mono uppercase tracking-wider ${config.color}`}>
                        {config.label}
                    </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${severityBadge[severity]}`}>
                    {severity.toUpperCase()}
                </span>
            </div>

            <h4 className="text-white font-bold mb-1">{title}</h4>
            <p className="text-zinc-400 text-sm mb-3">{description}</p>

            <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-4">
                    <span className={`${config.color} font-bold`}>{count} instances</span>
                    {location && <span className="text-zinc-600">📍 {location}</span>}
                </div>
                {timestamp && <span className="text-zinc-600">{timestamp}</span>}
            </div>
        </div>
    );
}
