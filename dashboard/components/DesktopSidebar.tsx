"use client";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { tabs } from '@/components/DashboardNavigation';

export default function DesktopSidebar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Determine active tab
    const tabParam = searchParams.get('tab');
    let activeTab = 'overview'; // Default
    if (pathname === '/power-play-press') activeTab = 'power_play';
    else if (pathname === '/paid-leave-watch') activeTab = 'paid_leave';
    else if (pathname === '/penalty-box') activeTab = 'penalty_box';
    else if (pathname === '/ops-center') activeTab = 'ops_center';
    else if (tabParam) activeTab = tabParam;

    const handleTabClick = (tabId: string, href?: string) => {
        if (href) {
            router.push(href);
        } else {
            router.push(`/?tab=${tabId}`);
        }
    };

    return (
        <aside className="hidden lg:flex fixed left-0 top-[81px] bottom-0 w-[200px] bg-[#050505] border-r border-zinc-800 flex-col z-50 pt-6">
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-hide">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id, tab.href)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group relative border
                                ${isActive
                                    ? 'bg-zinc-900 border-zinc-700 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-neon-red' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                            <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-bold font-mono uppercase tracking-wider truncate ${isActive ? 'text-white' : ''}`}>
                                    {tab.label.replace('MN DHS ', '').replace(' (BETA)', '')}
                                </span>
                                <span className="text-[9px] text-zinc-600 font-medium tracking-tight truncate group-hover:text-zinc-500">
                                    {tab.description}
                                </span>
                            </div>
                            {isActive && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-neon-red" />}
                        </button>
                    )
                })}
                <div className="mt-8 px-[5px] w-full pointer-events-none pb-8 select-none">
                    <Image
                        src="/assets/logos/crosscheck-literal.png"
                        alt="Project CrossCheck"
                        width={240}
                        height={80}
                        className="w-full h-auto object-contain opacity-100 block"
                        priority
                    />
                </div>
            </nav>
        </aside>
    );
}
