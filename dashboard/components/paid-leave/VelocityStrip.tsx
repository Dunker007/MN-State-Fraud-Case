"use client";

import { useEffect, useState } from 'react';

interface MetricProps {
    label: string;
    value: string | number;
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
    alert?: boolean;
}

function Metric({ label, value, subtext, trend, alert }: MetricProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    // Flash animation when value changes
    useEffect(() => {
        setIsAnimating(true);
        setDisplayValue(value);
        const timer = setTimeout(() => setIsAnimating(false), 500);
        return () => clearTimeout(timer);
    }, [value]);

    const trendColors = {
        up: 'text-red-500',
        down: 'text-emerald-500',
        neutral: 'text-zinc-500'
    };

    return (
        <div className={`flex-1 px-4 py-3 border-r border-zinc-800 last:border-r-0 transition-colors duration-300 ${alert ? 'bg-red-950/20' : ''
            } ${isAnimating ? 'bg-purple-950/20' : ''}`}>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1">
                {label}
            </div>
            <div className={`text-xl font-black font-mono transition-all duration-300 ${alert ? 'text-red-500' : 'text-white'
                } ${isAnimating ? 'scale-110 text-purple-400' : ''}`}>
                {displayValue}
            </div>
            {subtext && (
                <div className={`text-[10px] font-mono ${trend ? trendColors[trend] : 'text-zinc-600'}`}>
                    {trend === 'up' && '▲ '}
                    {trend === 'down' && '▼ '}
                    {subtext}
                </div>
            )}
        </div>
    );
}

interface VelocityStripProps {
    applicationsToday: number;
    approvalRate: number;
    avgProcessingHours: number;
    burnRateDaily: number;
    daysToInsolvency: number;
}

export default function VelocityStrip({
    applicationsToday,
    approvalRate,
    avgProcessingHours,
    burnRateDaily,
    daysToInsolvency
}: VelocityStripProps) {
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setLastUpdated(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex divide-x divide-zinc-800">
                <Metric
                    label="Applications Today"
                    value={applicationsToday.toLocaleString()}
                    subtext="+12% vs avg"
                    trend="up"
                />
                <Metric
                    label="Approval Rate"
                    value={`${approvalRate}%`}
                    subtext="Last 24h"
                />
                <Metric
                    label="Avg Processing"
                    value={`${avgProcessingHours}h`}
                    subtext="Target: 48h"
                    trend={avgProcessingHours < 48 ? 'down' : 'up'}
                />
                <Metric
                    label="Burn Rate"
                    value={`$${burnRateDaily.toFixed(1)}M`}
                    subtext="/day"
                    trend="up"
                    alert={burnRateDaily > 5}
                />
                <Metric
                    label="Days to Insolvency"
                    value={daysToInsolvency}
                    subtext="Projected"
                    alert={daysToInsolvency < 180}
                />
            </div>
            {/* Last updated indicator */}
            <div className="px-4 py-1 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600 font-mono">REAL-TIME METRICS</span>
                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    {lastUpdated}
                </span>
            </div>
        </div>
    );
}
