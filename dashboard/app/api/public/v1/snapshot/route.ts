import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

/**
 * Public API v1 - Snapshot Endpoint
 * 
 * Provides read-only access to current state for third-party embeds
 * Rate limited: 100 requests/hour
 */

export async function GET(request: Request) {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'anonymous';

    // Check rate limit
    const rateLimitResult = checkRateLimit(`public:${ip}`, 'public');

    if (!rateLimitResult.allowed) {
        return NextResponse.json({
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter
        }, {
            status: 429,
            headers: getRateLimitHeaders(rateLimitResult)
        });
    }

    // Get base URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    try {
        // Fetch current state from internal APIs
        const [paidLeave, patterns, simulation] = await Promise.all([
            fetch(`${baseUrl}/api/paid-leave`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${baseUrl}/api/fraud/patterns`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${baseUrl}/api/analytics/simulation`).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        // Build public snapshot
        const snapshot = {
            fundStatus: paidLeave?.current ? {
                balanceMillions: paidLeave.current.fund_balance_millions,
                claimsReceived: paidLeave.current.claims_received,
                claimsApproved: paidLeave.current.claims_approved,
                payoutMillions: paidLeave.current.total_payout_millions,
                lastUpdated: paidLeave.current.date
            } : null,

            fraudOverview: patterns ? {
                totalPatterns: patterns.count,
                criticalCount: patterns.stats?.criticalPatterns || 0,
                flaggedClaims: patterns.stats?.totalFlaggedClaims || 0,
                estimatedExposure: patterns.stats?.estimatedExposure || 'N/A',
                averageRiskScore: patterns.stats?.averageRiskScore || 0
            } : null,

            projection: simulation?.results ? {
                medianInsolvencyDate: simulation.results.median,
                daysRemaining: simulation.results.meanDays,
                probabilityBefore60Days: simulation.results.probabilities?.before60Days || 0,
                confidence: simulation.results.confidence
            } : null
        };

        return NextResponse.json({
            success: true,
            version: 'v1',
            snapshot,
            meta: {
                generatedAt: new Date().toISOString(),
                source: 'Paid Leave Watch - Project CrossCheck',
                disclaimer: 'Public data snapshot. Projections are illustrative models, not official forecasts.',
                documentation: '/api/public/v1/docs'
            }
        }, {
            headers: {
                ...getRateLimitHeaders(rateLimitResult),
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300' // 5 min cache
            }
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to generate snapshot',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}
