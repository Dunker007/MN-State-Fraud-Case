import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Vercel Pro: Ultra-low latency vitals reporting

/**
 * API endpoint for receiving Web Vitals metrics
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // In production, you could send these to a monitoring service
        // For now, we'll just log them
        console.log('[Web Vitals]', {
            metric: body.name,
            value: body.value,
            rating: body.rating,
            timestamp: new Date().toISOString(),
        });

        // TODO: Store in database or send to external monitoring service
        // Examples:
        // - Send to Vercel Analytics
        // - Send to Sentry
        // - Store in database for dashboard
        // - Send to Datadog/New Relic

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing vitals:', error);
        return NextResponse.json(
            { error: 'Failed to process metrics' },
            { status: 500 }
        );
    }
}

// Allow OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
