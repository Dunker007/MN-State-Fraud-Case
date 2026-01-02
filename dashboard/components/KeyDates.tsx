"use client";

import { motion } from 'framer-motion';
import { Calendar, Gavel, FileText, Users2, Clock } from 'lucide-react';

export default function KeyDates() {
    const events = [
        {
            date: 'Jan 15, 2026',
            title: 'Grand Jury Hearing',
            description: 'Housing Stabilization fraud case',
            type: 'court',
            icon: Gavel,
            color: 'text-red-400',
            daysUntil: 15
        },
        {
            date: 'Jan 22, 2026',
            title: 'Document Filing Deadline',
            description: 'EIDBI pattern evidence submission',
            type: 'filing',
            icon: FileText,
            color: 'text-amber-400',
            daysUntil: 22
        },
        {
            date: 'Feb 3, 2026',
            title: 'Witness Deposition',
            description: 'Former DHS employee testimony',
            type: 'deposition',
            icon: Users2,
            color: 'text-blue-400',
            daysUntil: 34
        },
        {
            date: 'Feb 14, 2026',
            title: 'FBI Raid Anniversary',
            description: '1-year since Dec 2025 operations',
            type: 'milestone',
            icon: Clock,
            color: 'text-purple-400',
            daysUntil: 45
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-bold text-white font-mono uppercase">KEY_DATES</h3>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono">Next 60 Days</span>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
                {events.map((event, index) => {
                    const Icon = event.icon;
                    return (
                        <motion.div
                            key={event.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-6 pb-4 border-l-2 border-zinc-800 last:border-l-0 last:pb-0"
                        >
                            {/* Timeline dot */}
                            <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full ${event.color.replace('text-', 'bg-')} border-2 border-zinc-950`} />

                            {/* Content */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Icon className={`w-4 h-4 ${event.color}`} />
                                    <span className="text-xs font-bold text-white font-mono">
                                        {event.title}
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-500">
                                    {event.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-600 font-mono">
                                        {event.date}
                                    </span>
                                    <span className={`text-[10px] ${event.color} font-mono font-bold`}>
                                        {event.daysUntil}d
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-zinc-800">
                <button className="w-full text-[10px] text-cyan-500 hover:text-cyan-400 font-mono uppercase transition-colors">
                    View Full Calendar →
                </button>
            </div>
        </motion.div>
    );
}
