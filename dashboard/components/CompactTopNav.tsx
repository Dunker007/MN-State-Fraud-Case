"use client";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { tabs } from '@/components/DashboardNavigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

import Link from 'next/link';

export default function CompactTopNav() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Determine active tab
    const tabParam = searchParams.get('tab');
    let activeTab = 'overview';
    if (pathname === '/power-play-press') activeTab = 'power_play';
    else if (pathname === '/paid-leave-watch') activeTab = 'paid_leave';
    else if (pathname === '/paid-leave-sandbox') activeTab = 'paid_leave'; // Map sandbox to same tab for now
    else if (pathname === '/penalty-box') activeTab = 'penalty_box';
    else if (pathname === '/ops-center') activeTab = 'ops_center';
    else if (tabParam) activeTab = tabParam;

    // Define Custom Order
    const priorityIds = ['power_play', 'paid_leave', 'ops_center', 'intel', 'investigation'];
    const priorityTabs = priorityIds.map(id => tabs.find(t => t.id === id)).filter(Boolean);
    const otherTabs = tabs.filter(t => t.id !== 'overview' && !priorityIds.includes(t.id));
    const orderedTabs = [...priorityTabs, ...otherTabs];

    const handleTabClick = (tabId: string, href?: string) => {
        if (href) {
            router.push(href);
        } else {
            router.push(`/?tab=${tabId}`);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] h-16 bg-black border-b border-zinc-800 flex items-center px-4 justify-between">
            {/* Logo Area (Now Home Link) */}
            <Link href="/" className="flex items-center gap-4 shrink-0 mr-8 hover:opacity-80 transition-opacity group">
                <Image
                    src="/assets/logos/crosscheck-literal.png"
                    alt="CrossCheck"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                />
                <span className="hidden md:block font-black italic tracking-tighter uppercase text-xl">
                    <span className="text-white group-hover:text-red-500 transition-colors">PROJECT</span> <span className="text-red-600 group-hover:text-white transition-colors">CROSSCHECK</span>
                </span>
            </Link>

            {/* Scrollable Navigation Items */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide h-full">
                {orderedTabs.map((tab) => {
                    if (!tab) return null;
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id, tab.href)}
                            className={`
                                relative flex items-center gap-2 px-3 h-10 rounded-md transition-all duration-200 shrink-0 group
                                ${isActive
                                    ? 'text-white'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : 'group-hover:text-zinc-300'}`} />
                            <span className={`text-sm font-bold font-mono uppercase tracking-tight ${isActive ? 'text-white' : ''}`}>
                                {tab.label.replace('MN DHS ', '').replace('MN ', '')}
                            </span>

                            {/* Active Indicator Line */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTopNav"
                                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Right Side / User / Status */}
            <div className="shrink-0 ml-4 flex items-center gap-3 border-l border-zinc-800 pl-4 h-8 text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="hidden sm:inline">SYSTEM ONLINE</span>
                </div>
            </div>
        </nav>
    );
}
