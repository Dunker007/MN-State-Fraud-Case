"use client";

import { useRouter, usePathname } from 'next/navigation';
import DashboardNavigation from '@/components/DashboardNavigation';

interface PageNavigationProps {
    activeTab?: string;
}

export default function PageNavigation({ activeTab }: PageNavigationProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Determine active tab based on path if not provided
    const currentTab = activeTab || (pathname === '/power-play-press' ? 'power_play' : pathname === '/paid-leave-watch' ? 'paid_leave' : 'overview');

    const handleTabChange = (tabId: string) => {
        if (tabId === currentTab) return;

        // Handle direct links for pages that are separate routes
        if (tabId === 'power_play') {
            router.push('/power-play-press');
            return;
        }
        if (tabId === 'paid_leave') {
            router.push('/paid-leave-watch');
            return;
        }

        // Navigate back to the main dashboard with the selected tab active
        router.push(`/?tab=${tabId}`);
    };

    return (
        <DashboardNavigation
            activeTab={currentTab}
            onTabChange={handleTabChange}
        />
    );
}
