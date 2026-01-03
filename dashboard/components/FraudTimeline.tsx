"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, Flag, DollarSign, Gavel, Eye } from 'lucide-react';

interface TimelineEvent {
    date: string;
    title: string;
    description: string;
    type: 'warning' | 'fraud' | 'investigation' | 'legal' | 'milestone';
    amount?: string;
}

const timelineEvents: TimelineEvent[] = [
    {
        date: "2019-2020",
        title: "COVID Relief Surge",
        description: "Federal child nutrition program funds surge during pandemic. Minnesota DHS begins disbursing emergency funds.",
        type: "milestone"
    },
    {
        date: "Feb 2021",
        title: "First Red Flags",
        description: "Internal DHS auditors notice unusual patterns in Feeding Our Future claims. Warnings ignored.",
        type: "warning"
    },
    {
        date: "July 2021",
        title: "FBI Investigation Begins",
        description: "Federal Bureau of Investigation opens probe into suspected fraud scheme.",
        type: "investigation"
    },
    {
        date: "Jan 2022",
        title: "Raids & Arrests",
        description: "FBI executes multiple search warrants. First arrests in $250M fraud scheme.",
        type: "legal"
    },
    {
        date: "Sep 2022",
        title: "Indictments",
        description: "47 defendants charged in largest pandemic fraud case in U.S. history.",
        type: "legal",
        amount: "$250M+"
    },
    {
        date: "2023",
        title: "Trials Begin",
        description: "First convictions secured. Network of shell companies and money laundering exposed.",
        type: "legal"
    },
    {
        date: "2024",
        title: "Pattern Emerges",
        description: "CrossCheck analysis reveals systemic vulnerabilities exploited across $9B+ in total diversion.",
        type: "fraud",
        amount: "$9B+"
    },
    {
        date: "Jan 2026",
        title: "Paid Leave Launch",
        description: "Minnesota Paid Leave program launches. Similar oversight gaps identified.",
        type: "warning"
    }
];

const typeConfig = {
    warning: { icon: AlertTriangle, color: 'text-amber-500', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
    fraud: { icon: DollarSign, color: 'text-red-500', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' },
    investigation: { icon: Eye, color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
    legal: { icon: Gavel, color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
    milestone: { icon: Flag, color: 'text-zinc-400', bgColor: 'bg-zinc-500/20', borderColor: 'border-zinc-500/30' }
};

export default function FraudTimeline() {
    const [visibleCount, setVisibleCount] = useState(0);

    useEffect(() => {
        // Animate items appearing one by one
        const timer = setInterval(() => {
            setVisibleCount(prev => {
                if (prev >= timelineEvents.length) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, 200);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-gradient-to-b from-zinc-900/50 to-black border border-zinc-800 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">FRAUD TIMELINE</h3>
                    <p className="text-xs text-zinc-500 font-mono">KEY EVENTS • 2019-2026</p>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Center Line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-zinc-700 via-red-500/50 to-zinc-800" />

                <div className="space-y-6">
                    {timelineEvents.map((event, index) => {
                        const config = typeConfig[event.type];
                        const Icon = config.icon;
                        const isVisible = index < visibleCount;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="relative pl-14"
                            >
                                {/* Icon Node */}
                                <div className={`absolute left-3 w-6 h-6 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                                    <Icon className={`w-3 h-3 ${config.color}`} />
                                </div>

                                {/* Content */}
                                <div className={`p-4 bg-black/50 rounded-lg border ${config.borderColor} hover:border-opacity-100 transition-colors`}>
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                            <span className={`text-xs font-mono ${config.color}`}>{event.date}</span>
                                            <h4 className="text-white font-bold">{event.title}</h4>
                                        </div>
                                        {event.amount && (
                                            <span className="px-2 py-1 bg-red-950/50 border border-red-500/30 rounded text-xs font-mono text-red-400">
                                                {event.amount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-400">{event.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                    {timelineEvents.length} KEY EVENTS TRACKED • ONGOING INVESTIGATION
                </p>
            </div>
        </div>
    );
}
