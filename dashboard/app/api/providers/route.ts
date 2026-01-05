/**
 * Provider Data Pipeline API
 * 
 * Endpoints:
 * - GET ?action=stats         - Get database statistics
 * - GET ?action=query         - Query providers with filters
 * - GET ?action=closed        - Get closed licenses summary
 * - GET ?action=violations    - Get high-violation providers
 * - GET ?action=needs-scrape  - Get providers needing re-scrape
 * - POST action=import        - Import from masterlist CSV
 * - POST action=scrape        - Trigger scrape for specific providers
 * - POST action=scrape-sample - Scrape a sample for testing
 * 
 * @author Alex Vance - Project CrossCheck
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    loadDatabase,
    saveDatabase,
    queryProviders,
    getDatabaseStats,
    getClosedLicensesSummary,
    getHighViolationProviders,
    getProvidersNeedingScrape,
    importFromMasterlist,
    updateWithScrapedData,
    exportToCsv,
    ProviderQueryOptions,
} from '@/lib/provider-db';
import {
    scrapeProvider,
    scrapeProviders,
    ScrapedProviderData,
    ScrapeProgress,
} from '@/lib/provider-scraper';
import { masterlistData } from '@/lib/data';

export const dynamic = 'force-dynamic';

// --- GET Handler ---

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    try {
        const db = await loadDatabase();

        switch (action) {
            case 'stats': {
                const stats = getDatabaseStats(db);
                return NextResponse.json({
                    success: true,
                    data: stats
                });
            }

            case 'query': {
                const options: ProviderQueryOptions = {};

                // Parse query parameters
                const status = searchParams.get('status');
                if (status) options.status = status.split(',');

                const county = searchParams.get('county');
                if (county) options.county = county.split(',');

                const serviceType = searchParams.get('serviceType');
                if (serviceType) options.serviceType = serviceType.split(',');

                const hasViolations = searchParams.get('hasViolations');
                if (hasViolations) options.hasViolations = hasViolations === 'true';

                const isClosed = searchParams.get('isClosed');
                if (isClosed) options.isClosed = isClosed === 'true';

                const minViolations = searchParams.get('minViolations');
                if (minViolations) options.minViolationCount = parseInt(minViolations, 10);

                const sortBy = searchParams.get('sortBy');
                if (sortBy) options.sortBy = sortBy as keyof typeof options.sortBy;

                const sortOrder = searchParams.get('sortOrder');
                if (sortOrder) options.sortOrder = sortOrder as 'asc' | 'desc';

                const limit = searchParams.get('limit');
                if (limit) options.limit = parseInt(limit, 10);

                const offset = searchParams.get('offset');
                if (offset) options.offset = parseInt(offset, 10);

                const results = queryProviders(db, options);

                return NextResponse.json({
                    success: true,
                    count: results.length,
                    data: results
                });
            }

            case 'closed': {
                const summary = getClosedLicensesSummary(db);
                return NextResponse.json({
                    success: true,
                    data: summary
                });
            }

            case 'violations': {
                const minViolations = searchParams.get('minViolations');
                const threshold = minViolations ? parseInt(minViolations, 10) : 3;
                const providers = getHighViolationProviders(db, threshold);

                return NextResponse.json({
                    success: true,
                    count: providers.length,
                    data: providers.slice(0, 100) // Limit response size
                });
            }

            case 'needs-scrape': {
                const maxAgeDays = searchParams.get('maxAgeDays');
                const days = maxAgeDays ? parseInt(maxAgeDays, 10) : 30;
                const providers = getProvidersNeedingScrape(db, days);

                return NextResponse.json({
                    success: true,
                    count: providers.length,
                    sampleLicenseIds: providers.slice(0, 50).map(p => p.license_id)
                });
            }

            case 'export': {
                const format = searchParams.get('format') || 'json';

                if (format === 'csv') {
                    const csv = exportToCsv(db);
                    return new NextResponse(csv, {
                        headers: {
                            'Content-Type': 'text/csv',
                            'Content-Disposition': `attachment; filename="providers_${new Date().toISOString().split('T')[0]}.csv"`
                        }
                    });
                }

                return NextResponse.json({
                    success: true,
                    meta: db.meta,
                    data: Object.values(db.providers)
                });
            }

            case 'lookup': {
                const licenseId = searchParams.get('licenseId');
                if (!licenseId) {
                    return NextResponse.json({
                        success: false,
                        error: 'licenseId parameter required'
                    }, { status: 400 });
                }

                const provider = db.providers[licenseId];
                if (!provider) {
                    return NextResponse.json({
                        success: false,
                        error: 'Provider not found'
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: provider
                });
            }

            default:
                return NextResponse.json({
                    success: false,
                    error: `Unknown action: ${action}`
                }, { status: 400 });
        }
    } catch (error) {
        console.error('[Provider Pipeline] GET error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// --- POST Handler ---

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || '';

    try {
        const db = await loadDatabase();

        switch (action) {
            case 'import': {
                // Import from the existing masterlist data
                const entities = masterlistData.entities;

                if (!entities || entities.length === 0) {
                    return NextResponse.json({
                        success: false,
                        error: 'No masterlist entities found'
                    }, { status: 400 });
                }

                const updatedDb = await importFromMasterlist(entities, db);
                const stats = getDatabaseStats(updatedDb);

                return NextResponse.json({
                    success: true,
                    message: `Imported ${entities.length} providers`,
                    stats
                });
            }

            case 'scrape': {
                // Scrape specific license IDs from request body
                const body = await request.json();
                const licenseIds: string[] = body.licenseIds || [];

                if (licenseIds.length === 0) {
                    return NextResponse.json({
                        success: false,
                        error: 'No license IDs provided'
                    }, { status: 400 });
                }

                if (licenseIds.length > 50) {
                    return NextResponse.json({
                        success: false,
                        error: 'Maximum 50 license IDs per request'
                    }, { status: 400 });
                }

                const results = await scrapeProviders(licenseIds);
                let successCount = 0;
                let failCount = 0;

                for (const [licenseId, result] of results) {
                    if (result.success && result.data) {
                        const existing = db.providers[licenseId];
                        if (existing) {
                            db.providers[licenseId] = updateWithScrapedData(existing, result.data);
                        }
                        successCount++;
                    } else {
                        failCount++;
                    }
                }

                await saveDatabase(db);

                return NextResponse.json({
                    success: true,
                    scraped: successCount,
                    failed: failCount,
                    results: Object.fromEntries(
                        Array.from(results.entries()).map(([id, r]) => [
                            id,
                            { success: r.success, error: r.error }
                        ])
                    )
                });
            }

            case 'scrape-sample': {
                // Scrape a small sample for testing
                const sampleSize = Math.min(
                    parseInt(searchParams.get('size') || '5', 10),
                    10
                );

                // Get providers that haven't been scraped recently
                const needsScrape = getProvidersNeedingScrape(db, 7);
                const sample = needsScrape.slice(0, sampleSize);

                if (sample.length === 0) {
                    return NextResponse.json({
                        success: true,
                        message: 'All providers recently scraped',
                        scraped: 0
                    });
                }

                const licenseIds = sample.map(p => p.license_id);
                const results = await scrapeProviders(licenseIds);

                const scrapedData: { licenseId: string; data: ScrapedProviderData | undefined; error?: string }[] = [];

                for (const [licenseId, result] of results) {
                    if (result.success && result.data) {
                        const existing = db.providers[licenseId];
                        if (existing) {
                            db.providers[licenseId] = updateWithScrapedData(existing, result.data);
                        }
                    }
                    scrapedData.push({
                        licenseId,
                        data: result.data,
                        error: result.error
                    });
                }

                await saveDatabase(db);

                return NextResponse.json({
                    success: true,
                    scraped: scrapedData.filter(s => s.data?.scrape_success).length,
                    failed: scrapedData.filter(s => !s.data?.scrape_success).length,
                    results: scrapedData
                });
            }

            case 'scrape-single': {
                // Scrape a single provider
                const licenseId = searchParams.get('licenseId');
                if (!licenseId) {
                    return NextResponse.json({
                        success: false,
                        error: 'licenseId parameter required'
                    }, { status: 400 });
                }

                const result = await scrapeProvider(licenseId);

                if (result.success && result.data) {
                    const existing = db.providers[licenseId];
                    if (existing) {
                        db.providers[licenseId] = updateWithScrapedData(existing, result.data);
                        await saveDatabase(db);
                    }
                }

                return NextResponse.json({
                    success: result.success,
                    data: result.data,
                    error: result.error,
                    retries: result.retries
                });
            }

            default:
                return NextResponse.json({
                    success: false,
                    error: `Unknown action: ${action}. Valid actions: import, scrape, scrape-sample, scrape-single`
                }, { status: 400 });
        }
    } catch (error) {
        console.error('[Provider Pipeline] POST error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
