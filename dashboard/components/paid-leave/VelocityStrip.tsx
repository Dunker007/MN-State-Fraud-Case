"use client";

interface MetricProps {
    label: string;
    value: string | number;
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
    alert?: boolean;
}

function Metric({ label, value, subtext, trend, alert }: MetricProps) {
    const trendColors = {
        up: 'text-red-500',
        down: 'text-emerald-500',
        neutral: 'text-zinc-500'
    };

    return (
        <div className={`flex-1 px-4 py-3 border-r border-zinc-800 last:border-r-0 ${alert ? 'bg-red-950/20' : ''}`}>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1">
                {label}
            </div>
            <div className={`text-xl font-black font-mono ${alert ? 'text-red-500' : 'text-white'}`}>
                {value}
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
    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl flex divide-x divide-zinc-800 overflow-hidden">
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
    );
}
