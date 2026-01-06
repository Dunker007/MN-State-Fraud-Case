"use client";

import { usePathname } from 'next/navigation';
import { CrosscheckHeader } from './CrosscheckHeader';

export default function GlobalHeaderWrapper() {
    const pathname = usePathname();

    // List of paths where we want to HIDE the global header because they have their own (like Paid Leave Sandbox)
    const hiddenPaths = ['/paid-leave-sandbox'];

    // Check if the current path starts with any of the hidden paths (to handle subroutes if needed)
    // or exact match
    const shouldHide = hiddenPaths.some(path => pathname === path || pathname?.startsWith(path + '/'));

    if (shouldHide) return null;

    return <CrosscheckHeader />;
}
