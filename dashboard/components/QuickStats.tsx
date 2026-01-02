"use client";

import { motion } from 'framer-motion';
import { Users, AlertTriangle, FolderOpen, Scale, TrendingUp } from 'lucide-react';

export default function QuickStats() {
    const stats = [
        {
            label: 'Total Entities',
            value: '1,247',
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-blue-950/30',
            borderColor: 'border-blue-900/50'
        },
        {
            label: 'High-Risk Flagged',
            value: '89',
            icon: AlertTriangle,
            color: 'text-red-400',
            bgColor: 'bg-red-950/30',
            borderColor: 'border-red-900/50'
        },
        {
            label: 'Active Investigations',
            value: '12',
            icon: Scale,
            color: 'text-amber-400',
            bgColor: 'bg-amber-950/30',
            borderColor: 'border-amber-900/50'
        },
        {
            label: 'Evidence Documents',
            value: '456',
            icon: FolderOpen,
            color: 'text-green-400',
            bgColor: 'bg-green-950/30',
            borderColor: 'border-green-900/50'
        },
        {
            label: 'Patterns Identified',
            value: '23',
            icon: TrendingUp,
            color: 'text-purple-400',
            bgColor: 'bg-purple-950/30',
            borderColor: 'border-purple-900/50'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-lg p-4"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">QUICK_STATS</h3>
            </div>

            {/* Stats Grid */}
            <div className="space-y-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`${stat.bgColor} border ${stat.borderColor} rounded p-3 flex items-center gap-3`}
                        >
                            <Icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                                <div className={`text-lg font-bold ${stat.color} font-mono`}>
                                    {stat.value}
                                </div>
                                <div className="text-[10px] text-zinc-500 uppercase truncate">
                                    {stat.label}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-3 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-600 font-mono text-center">
                    Last Updated: Real-time
                </p>
            </div>
        </motion.div>
    );
}
