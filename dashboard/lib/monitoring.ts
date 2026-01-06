/**
 * Performance Monitoring & Web Vitals Tracking
 * 
 * Tracks and reports Core Web Vitals (LCP, FID, CLS, TTFB, INP)
 * for performance monitoring and optimization.
 */

import { onCLS, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

type WebVitalsMetric = Metric;

interface AnalyticsEvent {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
}

/**
 * Send Web Vitals metrics to analytics endpoint
 */
function sendToAnalytics(metric: WebVitalsMetric) {
    const body: AnalyticsEvent = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
    };

    // Send to our analytics API
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(body));
    } else {
        fetch('/api/analytics/vitals', {
            body: JSON.stringify(body),
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
        });
    }
}

/**
 * Initialize Web Vitals tracking
 * Call this once in your app's entry point (layout.tsx)
 */
export function initWebVitals() {
    if (typeof window === 'undefined') return;

    onCLS(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
}

/**
 * Track custom performance marks
 */
export function trackPerformanceMark(name: string) {
    if (typeof window === 'undefined') return;
    performance.mark(name);
}

/**
 * Measure time between two performance marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
    if (typeof window === 'undefined') return;

    try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];

        if (measure && measure.duration) {
            // Send to analytics
            fetch('/api/analytics/vitals', {
                body: JSON.stringify({
                    name: `custom.${name}`,
                    value: measure.duration,
                    rating: measure.duration < 1000 ? 'good' : measure.duration < 2500 ? 'needs-improvement' : 'poor',
                    delta: 0,
                    id: `${name}-${Date.now()}`,
                }),
                method: 'POST',
                keepalive: true,
                headers: { 'Content-Type': 'application/json' },
            });

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
            }
        }
    } catch (error) {
        console.error('Error measuring performance:', error);
    }
}

/**
 * Track API call performance
 */
export async function trackAPICall<T>(
    name: string,
    apiCall: () => Promise<T>
): Promise<T> {
    const startMark = `api-${name}-start`;
    const endMark = `api-${name}-end`;

    trackPerformanceMark(startMark);

    try {
        const result = await apiCall();
        trackPerformanceMark(endMark);
        measurePerformance(`api-${name}`, startMark, endMark);
        return result;
    } catch (error) {
        trackPerformanceMark(endMark);
        measurePerformance(`api-${name}`, startMark, endMark);
        throw error;
    }
}

export type { WebVitalsMetric, AnalyticsEvent };
