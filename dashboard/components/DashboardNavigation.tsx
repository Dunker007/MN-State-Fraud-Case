
"use client";


import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Target,
    Database,
    TrendingUp,
    Shield,
    Zap,
    Newspaper,
    AlertTriangle,
    ExternalLink,
    Clock
} from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon: typeof LayoutDashboard;
    description: string;
    href?: string;
}

const tabs: Tab[] = [
    { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard, description: 'Executive Summary' },
    { id: 'power_play', label: 'POWER PLAY PRESS', icon: Zap, description: 'Full Screen Intel Grid', href: '/power-play-press' },
    { id: 'paid_leave', label: 'PAID LEAVE WATCH', icon: Clock, description: 'Insolvency Tracker', href: '/paid-leave-watch' },
    { id: 'intel', label: 'INTEL', icon: Newspaper, description: 'Live News Feed' },
    { id: 'investigation', label: 'INVESTIGATION', icon: Target, description: 'Investigation Hub' },
    { id: 'org_chart', label: 'MN DHS ORG CHART', icon: Shield, description: 'Structural Failure Analysis' },
    { id: 'org_chart_beta', label: 'ORG CHART (BETA)', icon: Shield, description: 'Interactive Org Chart', href: '/org-chart-interactive' },

    { id: 'patterns', label: 'PATTERNS', icon: TrendingUp, description: 'Temporal & Network Analysis' },
    { id: 'entities', label: 'RISK ASSESSMENT', icon: AlertTriangle, description: 'High Value Targets' },
    { id: 'database', label: 'MN LICENSE DATABASE', icon: Database, description: 'Full Provider Masterlist' },
];

interface DashboardNavigationProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export default function DashboardNavigation({ activeTab, onTabChange }: DashboardNavigationProps) {
    return (
        <nav className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800 py-2">
            <div className="w-full max-w-[95%] mx-auto px-4">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        if (tab.href) {
                            return (
                                <a
                                    key={tab.id}
                                    href={tab.href}
                                    className={`
                                        relative flex items-center gap-2 px-4 py-3 font-mono text-sm whitespace-nowrap
                                        transition-all duration-200 rounded-lg
                                        ${isActive
                                            ? 'text-white'
                                            : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-neon-red' : 'text-purple-500'}`} />
                                    <span className="text-[10px] md:text-sm">{tab.label}</span>
                                    {!isActive && <ExternalLink className="w-3 h-3 opacity-50" />}

                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-red"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </a>
                            );
                        }

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`
                                    relative flex items-center gap-2 px-4 py-3 font-mono text-sm whitespace-nowrap
                                    transition-all duration-200
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-neon-red' : ''}`} />
                                <span className="text-[10px] md:text-sm">{tab.label}</span>

                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-red"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}

                    {/* Live indicator */}
                    <div className="ml-auto flex items-center gap-2 px-4 text-xs font-mono">
                        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                        <span className="text-zinc-500 hidden lg:inline">LIVE</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export { tabs };
export type { Tab };
