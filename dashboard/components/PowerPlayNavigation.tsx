"use client";

import { useRouter } from 'next/navigation';
import DashboardNavigation from '@/components/DashboardNavigation';

export default function PowerPlayNavigation() {
    const router = useRouter();

    const handleTabChange = (tabId: string) => {
        // If the user clicks "Power Play Press" again, do nothing
        if (tabId === 'power_play') return;

        // Navigate back to the main dashboard with the selected tab active
        router.push(`/?tab=${tabId}`);
    };

    return (
        <DashboardNavigation
            activeTab="power_play"
            onTabChange={handleTabChange}
        />
    );
}
