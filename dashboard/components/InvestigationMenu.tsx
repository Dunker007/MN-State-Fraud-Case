"use client";

import { motion } from "framer-motion";
import { Clipboard, Target, Clock, FileText, AlertTriangle } from "lucide-react";

export const investigationTabs = [
    { id: "workspace", label: "WORKSPACE", icon: Clipboard },
    { id: "targets", label: "TARGETS", icon: Target },
    { id: "risk_assessment", label: "RISK ASSESSMENT", icon: AlertTriangle },
    { id: "timelines", label: "TIMELINES", icon: Clock },
    { id: "evidence", label: "EVIDENCE", icon: FileText },
];

interface InvestigationMenuProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function InvestigationMenu({ activeTab, onTabChange }: InvestigationMenuProps) {
    return (
        <div className="sticky top-[57px] z-30 bg-black/80 backdrop-blur-md border-b border-zinc-800 py-1 mb-6 shadow-2xl">
            <div className="container mx-auto px-4 max-w-7xl flex items-center gap-8 overflow-x-auto scrollbar-hide">
                {investigationTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 py-3 text-xs font-bold font-mono tracking-widest transition-all whitespace-nowrap relative ${isActive
                                ? "text-neon-blue"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            <div className={`p-1 rounded ${isActive ? "bg-neon-blue/10" : "bg-transparent"}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            {tab.label}
                            {isActive && (
                                <motion.div
                                    layoutId="activeInvestigationTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon-blue"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
