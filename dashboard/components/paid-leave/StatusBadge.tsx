"use client";

import { AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

type StatusLevel = 'operational' | 'strained' | 'critical';

interface StatusBadgeProps {
    level: StatusLevel;
}

const config = {
    operational: {
        icon: CheckCircle,
        label: 'OPERATIONAL',
        color: 'text-cyan-400',
        bg: 'bg-cyan-950/30',
        border: 'border-cyan-800',
        glow: 'shadow-[0_0_15px_rgba(0,243,255,0.3)]'
    },
    strained: {
        icon: AlertTriangle,
        label: 'STRAINED',
        color: 'text-amber-400',
        bg: 'bg-amber-950/30',
        border: 'border-amber-800',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]'
    },
    critical: {
        icon: AlertOctagon,
        label: 'CRITICAL',
        color: 'text-red-500',
        bg: 'bg-red-950/30',
        border: 'border-red-800',
        glow: 'shadow-[0_0_15px_rgba(255,0,60,0.3)]'
    }
};

export default function StatusBadge({ level }: StatusBadgeProps) {
    const { icon: Icon, label, color, bg, border, glow } = config[level];

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${bg} ${border} border ${glow} ${color}`}>
            <Icon className={`w-5 h-5 ${level === 'critical' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-bold tracking-widest font-mono">{label}</span>
        </div>
    );
}

// Utility to determine status from fund percentage
export function getStatusLevel(healthPercent: number): StatusLevel {
    if (healthPercent >= 50) return 'operational';
    if (healthPercent >= 25) return 'strained';
    return 'critical';
}
