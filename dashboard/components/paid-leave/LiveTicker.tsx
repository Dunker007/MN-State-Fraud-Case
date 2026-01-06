"use client";

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, MessageSquare, Scale, FileText } from 'lucide-react';

interface TickerItem {
    id: string;
    type: 'fund' | 'claim' | 'fraud' | 'social' | 'court' | 'bill';
    message: string;
    timestamp: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Generate mock ticker items based on current data
function generateTickerItems(): TickerItem[] {
    const now = new Date();

    return [
        {
            id: '1',
            type: 'fund',
            message: 'FUND BALANCE: $468.2M remaining • Burn rate: $8.0M/day',
            timestamp: now.toISOString(),
            severity: 'medium'
        },
        {
            id: '2',
            type: 'claim',
            message: 'CLAIMS: 11,883 applications received in first 48 hours',
            timestamp: now.toISOString(),
            severity: 'low'
        },
        {
            id: '3',
            type: 'fraud',
            message: 'ALERT: 55407 Zip Cluster flagged — 47 instances detected',
            timestamp: now.toISOString(),
            severity: 'critical'
        },
        {
            id: '4',
            type: 'court',
            message: 'COURT: State v. ABC Medical Billing LLC filed in Hennepin County',
            timestamp: now.toISOString(),
            severity: 'high'
        },
        {
            id: '5',
            type: 'bill',
            message: 'LEGISLATURE: SF28 (Fraud Prevention) hearing scheduled for 01/08',
            timestamp: now.toISOString(),
            severity: 'medium'
        },
        {
            id: '6',
            type: 'social',
            message: 'OFFICIAL: Nicole Varilek confirms 4,005 claims approved for payment',
            timestamp: now.toISOString(),
            severity: 'low'
        }
    ];
}

function getIcon(type: TickerItem['type']) {
    switch (type) {
        case 'fund':
            return <TrendingDown className="w-4 h-4" />;
        case 'claim':
            return <TrendingUp className="w-4 h-4" />;
        case 'fraud':
            return <AlertTriangle className="w-4 h-4" />;
        case 'social':
            return <MessageSquare className="w-4 h-4" />;
        case 'court':
            return <Scale className="w-4 h-4" />;
        case 'bill':
            return <FileText className="w-4 h-4" />;
        default:
            return <Activity className="w-4 h-4" />;
    }
}

function getColor(severity: TickerItem['severity']) {
    switch (severity) {
        case 'critical':
            return 'text-red-500';
        case 'high':
            return 'text-amber-500';
        case 'medium':
            return 'text-purple-500';
        case 'low':
        default:
            return 'text-zinc-400';
    }
}

export default function LiveTicker() {
    const [items, setItems] = useState<TickerItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setItems(generateTickerItems());
    }, []);

    // Rotate through items
    useEffect(() => {
        if (items.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % items.length);
        }, 5000); // 5 seconds per item

        return () => clearInterval(interval);
    }, [items.length]);

    if (items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
        <div className="bg-black border-y border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-2">
                {/* Live indicator */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-red-500 uppercase">Live</span>
                </div>

                {/* Ticker content */}
                <div
                    className={`flex items-center gap-2 flex-1 ${getColor(currentItem.severity)} transition-all duration-500`}
                    key={currentItem.id}
                >
                    {getIcon(currentItem.type)}
                    <span className="text-sm font-mono truncate">
                        {currentItem.message}
                    </span>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-1 shrink-0">
                    {items.map((_, i) => (
                        <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-purple-500' : 'bg-zinc-700'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
