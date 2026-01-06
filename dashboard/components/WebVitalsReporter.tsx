'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/monitoring';

/**
 * Client component to initialize Web Vitals tracking
 * Must be a client component since it uses browser APIs
 */
export default function WebVitalsReporter() {
    useEffect(() => {
        initWebVitals();
    }, []);

    return null; // This component doesn't render anything
}
