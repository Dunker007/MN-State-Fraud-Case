import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for full refresh

interface CollectorResult {
    name: string;
    success: boolean;
    itemsCollected: number;
    duration: number;
    error?: string;
}

const COLLECTORS = [
    { name: 'DEED', endpoint: '/api/paid-leave/scrape', method: 'POST' },
    { name: 'Legislature', endpoint: '/api/legislature/bills', method: 'GET' },
    { name: 'Courts', endpoint: '/api/courts/search', method: 'GET' },
    { name: 'Fraud Patterns', endpoint: '/api/fraud/patterns', method: 'GET' },
    { name: 'Geo Counties', endpoint: '/api/geo/counties', method: 'GET' },
    { name: 'Social Pulse', endpoint: '/api/social/pulse', method: 'GET' },
    { name: 'News Intel', endpoint: '/api/news', method: 'GET' },
    { name: 'Monte Carlo', endpoint: '/api/analytics/simulation', method: 'GET' },
];

async function runCollector(collector: typeof COLLECTORS[0], baseUrl: string): Promise<CollectorResult> {
    const start = Date.now();

    try {
        const response = await fetch(`${baseUrl}${collector.endpoint}`, {
            method: collector.method,
            headers: { 'Content-Type': 'application/json' }
        });

        const duration = Date.now() - start;

        if (!response.ok) {
            return {
                name: collector.name,
                success: false,
                itemsCollected: 0,
                duration,
                error: `HTTP ${response.status}`
            };
        }

        const data = await response.json();

        // Extract item count from various response formats
        let itemsCollected = 0;
        if (typeof data.count === 'number') itemsCollected = data.count;
        else if (Array.isArray(data)) itemsCollected = data.length;
        else if (data.bills) itemsCollected = data.bills.length;
        else if (data.cases) itemsCollected = data.cases.length;
        else if (data.patterns) itemsCollected = data.patterns.length;
        else if (data.mentions) itemsCollected = data.mentions.length;
        else if (data.claimData) itemsCollected = Object.keys(data.claimData).length;
        else if (data.itemsCollected) itemsCollected = data.itemsCollected;

        return {
            name: collector.name,
            success: true,
            itemsCollected,
            duration
        };

    } catch (error) {
        return {
            name: collector.name,
            success: false,
            itemsCollected: 0,
            duration: Date.now() - start,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function GET(request: Request) {
    const startTime = Date.now();

    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    console.log('[CRON] Starting scheduled data refresh');
    console.log('[CRON] Base URL:', baseUrl);

    // Run all collectors in parallel
    const results = await Promise.all(
        COLLECTORS.map(collector => runCollector(collector, baseUrl))
    );

    const totalDuration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const totalItems = results.reduce((acc, r) => acc + r.itemsCollected, 0);

    console.log(`[CRON] Completed: ${successCount}/${results.length} collectors, ${totalItems} items in ${totalDuration}ms`);

    // Log results
    results.forEach(r => {
        if (r.success) {
            console.log(`[CRON] ✓ ${r.name}: ${r.itemsCollected} items (${r.duration}ms)`);
        } else {
            console.log(`[CRON] ✗ ${r.name}: ${r.error} (${r.duration}ms)`);
        }
    });

    return NextResponse.json({
        success: successCount === results.length,
        message: `Refreshed ${successCount}/${results.length} collectors`,
        results,
        stats: {
            successCount,
            failedCount: results.length - successCount,
            totalItems,
            totalDuration
        },
        timestamp: new Date().toISOString()
    });
}

// Also support POST for manual triggers
export async function POST(request: Request) {
    return GET(request);
}
