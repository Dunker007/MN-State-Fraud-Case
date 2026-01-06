"use client";

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, AlertCircle, Clock } from 'lucide-react';

interface SystemBannerProps {
    message?: string;
    severity?: 'info' | 'warning' | 'critical';
    showRefreshTime?: boolean;
    dismissible?: boolean;
    dismissKey?: string; // localStorage key for persistence
    expiryDays?: number; // Days before dismiss resets
}

const SEVERITY_STYLES = {
    info: {
        bg: 'bg-blue-900/80',
        border: 'border-blue-700',
        text: 'text-blue-200',
        icon: Info
    },
    warning: {
        bg: 'bg-amber-900/80',
        border: 'border-amber-700',
        text: 'text-amber-200',
        icon: AlertTriangle
    },
    critical: {
        bg: 'bg-red-900/80',
        border: 'border-red-700',
        text: 'text-red-200',
        icon: AlertCircle
    }
};

const DEFAULT_MESSAGE = `
All data from public sources (DEED, MN Revisor, Courts, GDELT). 
Projections are illustrative models based on actuarial analysis — not official forecasts.
Independent research project. Not affiliated with State of Minnesota.
`.trim().replace(/\n/g, ' ');

export default function SystemBanner({
    message = DEFAULT_MESSAGE,
    severity = 'warning',
    showRefreshTime = true,
    dismissible = true,
    dismissKey = 'system_banner_dismissed',
    expiryDays = 7
}: SystemBannerProps) {
    const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash
    const [lastRefresh, setLastRefresh] = useState<string | null>(null);

    useEffect(() => {
        // Check localStorage for dismissal
        const stored = localStorage.getItem(dismissKey);
        if (stored) {
            const { timestamp } = JSON.parse(stored);
            const expiryMs = expiryDays * 24 * 60 * 60 * 1000;
            if (Date.now() - timestamp < expiryMs) {
                setDismissed(true);
                return;
            }
        }
        setDismissed(false);

        // Fetch last refresh time
        if (showRefreshTime) {
            fetch('/api/health')
                .then(res => res.json())
                .then(data => {
                    if (data.lastRefresh) {
                        setLastRefresh(data.lastRefresh);
                    }
                })
                .catch(() => {
                    setLastRefresh(new Date().toISOString());
                });
        }
    }, [dismissKey, expiryDays, showRefreshTime]);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(dismissKey, JSON.stringify({ timestamp: Date.now() }));
    };

    if (dismissed) return null;

    const style = SEVERITY_STYLES[severity];
    const Icon = style.icon;

    return (
        <div className={`${style.bg} ${style.border} border-b ${style.text} py-2 px-4`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-medium truncate">
                        {message}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {showRefreshTime && lastRefresh && (
                        <span className="text-xs opacity-70 flex items-center gap-1 hidden md:flex">
                            <Clock className="w-3 h-3" />
                            Last refresh: {new Date(lastRefresh).toLocaleTimeString()}
                        </span>
                    )}

                    {dismissible && (
                        <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            aria-label="Dismiss banner"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
