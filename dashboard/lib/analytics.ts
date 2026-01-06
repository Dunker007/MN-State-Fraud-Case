/**
 * Privacy-First Analytics Tracking
 * 
 * Lightweight event tracking without PII collection.
 * Integrates with Vercel Analytics for visualization.
 */

export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, string | number | boolean>;
    timestamp?: number;
}

/**
 * Track a custom event
 */
export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
        name,
        properties,
        timestamp: Date.now(),
    };

    // Send to Vercel Analytics (if available)
    if ('va' in window && typeof (window as any).va === 'function') {
        (window as any).va('event', name, properties);
    }

    // Send to our custom endpoint
    fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
    }).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
            console.error('Failed to track event:', error);
        }
    });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', name, properties);
    }
}

/**
 * Track page view
 */
export function trackPageView(page: string, domain?: string) {
    trackEvent('page_view', {
        page,
        domain: domain || window.location.hostname,
        referrer: document.referrer || 'direct',
    });
}

/**
 * Track navigation between tabs
 */
export function trackTabChange(from: string, to: string) {
    trackEvent('tab_change', { from, to });
}

/**
 * Track domain-specific engagement
 */
export function trackDomainEngagement(action: string, domain: string) {
    trackEvent('domain_engagement', { action, domain });
}

/**
 * Track export/download actions
 */
export function trackExport(format: string, dataType: string) {
    trackEvent('export', { format, dataType });
}

/**
 * Track search/filter actions
 */
export function trackSearch(query: string, resultCount: number) {
    trackEvent('search', {
        queryLength: query.length,
        resultCount,
        // Don't send actual query for privacy
    });
}

/**
 * Track map interactions
 */
export function trackMapInteraction(action: 'click' | 'hover', county: string) {
    trackEvent('map_interaction', { action, county });
}

/**
 * Track widget visibility toggles
 */
export function trackWidgetToggle(widgetName: string, visible: boolean) {
    trackEvent('widget_toggle', { widgetName, visible });
}

/**
 * Track performance issues
 */
export function trackPerformanceIssue(metric: string, value: number) {
    trackEvent('performance_issue', { metric, value });
}

/**
 * Track errors (for user-facing errors, not technical crashes)
 */
export function trackError(errorType: string, context?: string) {
    const properties: Record<string, string> = { errorType };
    if (context) properties.context = context;
    trackEvent('user_error', properties);
}
