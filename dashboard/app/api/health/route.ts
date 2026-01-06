import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CollectorStatus {
    name: string;
    status: 'healthy' | 'degraded' | 'error';
    lastCheck: string | null;
    responseTime?: number;
    itemCount?: number;
    error?: string;
}

interface HealthResponse {
    status: 'healthy' | 'degraded' | 'critical';
    version: string;
    uptime: number;
    lastRefresh: string | null;
    collectors: CollectorStatus[];
    database: {
        status: 'connected' | 'error';
        snapshotCount: number;
    };
    externalApis: {
        gdelt: 'available' | 'unavailable';
        reddit: 'available' | 'unavailable';
        npiRegistry: 'available' | 'unavailable';
    };
}

// Track uptime from module load
const startTime = Date.now();

async function checkCollector(name: string, endpoint: string): Promise<CollectorStatus> {
    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${endpoint}`, {
            signal: controller.signal
        });
        clearTimeout(timeout);

        const responseTime = Date.now() - start;

        if (!response.ok) {
            return {
                name,
                status: 'degraded',
                lastCheck: new Date().toISOString(),
                responseTime,
                error: `HTTP ${response.status}`
            };
        }

        const data = await response.json();
        const itemCount = data.count || data.patterns?.length || data.bills?.length ||
            data.cases?.length || data.mentions?.length ||
            (data.claimData ? Object.keys(data.claimData).length : 0) ||
            (Array.isArray(data) ? data.length : 0);

        return {
            name,
            status: 'healthy',
            lastCheck: new Date().toISOString(),
            responseTime,
            itemCount
        };
    } catch (error) {
        return {
            name,
            status: 'error',
            lastCheck: new Date().toISOString(),
            responseTime: Date.now() - start,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

async function checkExternalApi(url: string): Promise<'available' | 'unavailable'> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal
        });
        clearTimeout(timeout);
        return response.ok ? 'available' : 'unavailable';
    } catch {
        return 'unavailable';
    }
}

export async function GET() {
    const collectors: CollectorStatus[] = [];

    // Check all internal collectors
    const collectorEndpoints = [
        { name: 'DEED', endpoint: '/api/paid-leave' },
        { name: 'Legislature', endpoint: '/api/legislature/bills' },
        { name: 'Courts', endpoint: '/api/courts/search' },
        { name: 'Fraud Patterns', endpoint: '/api/fraud/patterns' },
        { name: 'Geo Counties', endpoint: '/api/geo/counties' },
        { name: 'Social Pulse', endpoint: '/api/social/pulse' },
        { name: 'News', endpoint: '/api/news' },
    ];

    // Check collectors in parallel
    const collectorResults = await Promise.all(
        collectorEndpoints.map(c => checkCollector(c.name, c.endpoint))
    );
    collectors.push(...collectorResults);

    // Check external APIs in parallel
    const [gdelt, reddit, npi] = await Promise.all([
        checkExternalApi('https://api.gdeltproject.org/api/v2/doc/doc'),
        checkExternalApi('https://www.reddit.com/r/minnesota/.json'),
        checkExternalApi('https://npiregistry.cms.hhs.gov/api/')
    ]);

    // Count database snapshots
    let snapshotCount = 0;
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const dataPath = path.join(process.cwd(), 'lib', 'paid-leave-data.json');
        const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
        snapshotCount = data.snapshots?.length || 0;
    } catch {
        snapshotCount = 0;
    }

    // Calculate overall status
    const healthyCount = collectors.filter(c => c.status === 'healthy').length;
    const errorCount = collectors.filter(c => c.status === 'error').length;

    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (errorCount > 2) overallStatus = 'critical';
    else if (errorCount > 0 || healthyCount < collectors.length) overallStatus = 'degraded';

    const response: HealthResponse = {
        status: overallStatus,
        version: '2.0.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        lastRefresh: collectors.find(c => c.lastCheck)?.lastCheck || null,
        collectors,
        database: {
            status: snapshotCount > 0 ? 'connected' : 'error',
            snapshotCount
        },
        externalApis: {
            gdelt,
            reddit,
            npiRegistry: npi
        }
    };

    return NextResponse.json(response);
}
