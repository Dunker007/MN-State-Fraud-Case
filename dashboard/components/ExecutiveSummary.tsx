"use client";

import { motion } from "framer-motion";
import {
    DollarSign,
    Users,
    AlertTriangle,
    Gavel,
    Target,
    TrendingUp,
    Skull,
    Building2
} from "lucide-react";

interface StatCard {
    label: string;
    value: string;
    subValue?: string;
    icon: typeof DollarSign;
    color: string;
    trend?: "up" | "down" | "critical";
}

const keyStats: StatCard[] = [
    {
        label: "TOTAL FRAUD EXPOSURE",
        value: "$9.0B",
        subValue: "Federal Estimate",
        icon: DollarSign,
        color: "text-neon-red",
        trend: "critical"
    },
    {
        label: "ENTITIES FLAGGED",
        value: "3,049",
        subValue: "of 19,155 analyzed",
        icon: Building2,
        color: "text-amber-500"
    },
    {
        label: "FEDERAL INDICTMENTS",
        value: "70+",
        subValue: "DOJ District MN",
        icon: Gavel,
        color: "text-purple-500"
    },
    {
        label: "AT LARGE",
        value: "1",
        subValue: "Fled to Kenya",
        icon: Skull,
        color: "text-neon-red",
        trend: "critical"
    },
    {
        label: "COMER 7 TARGETS",
        value: "7",
        subValue: "House Oversight",
        icon: Target,
        color: "text-amber-500"
    },
    {
        label: "PATTERNS DETECTED",
        value: "6",
        subValue: "3 Critical",
        icon: AlertTriangle,
        color: "text-neon-red"
    },
];

export default function ExecutiveSummary() {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6"
        >
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-neon-red" />
                    <h2 className="text-lg font-bold text-white font-mono">EXECUTIVE_SUMMARY</h2>
                </div>
                <div className="text-xs font-mono text-zinc-600">
                    Last Updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {keyStats.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                                bg-zinc-900/50 border border-zinc-800 p-3 rounded
                                hover:border-zinc-700 transition-colors
                                ${stat.trend === "critical" ? "border-l-2 border-l-neon-red" : ""}
                            `}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-3 h-3 ${stat.color}`} />
                                <span className="text-[10px] text-zinc-500 font-mono uppercase truncate">
                                    {stat.label}
                                </span>
                            </div>
                            <div className={`text-xl font-bold font-mono ${stat.color}`}>
                                {stat.value}
                            </div>
                            {stat.subValue && (
                                <div className="text-[10px] text-zinc-600 font-mono">
                                    {stat.subValue}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </motion.section>
    );
}
