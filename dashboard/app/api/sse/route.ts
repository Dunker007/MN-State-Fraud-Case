import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const encoder = new TextEncoder();

    // Create a streaming response
    const customReadable = new ReadableStream({
        start(controller) {
            // Initial connection message
            controller.enqueue(encoder.encode('data: connected\n\n'));

            const EVENTS = [
                { type: 'fraud', message: 'Suspicious IP Cluster flagged in Dakota County', severity: 'high', source: 'IP Filter' },
                { type: 'fund', message: 'Batch payout processed: $4.2M released', severity: 'low', source: 'Payment Gateway' },
                { type: 'claim', message: 'New high-value disability claim approved ($1,100/wk)', severity: 'medium', source: 'DEED' },
                { type: 'social', message: 'Negative sentiment spike detected on Twitter/X', severity: 'medium', source: 'Social Pulse' },
                { type: 'court', message: 'New docket updated: MN vs. Provider XYZ', severity: 'high', source: 'Court Scraper' },
                { type: 'fund', message: 'Employer tax contribution received: +$120K', severity: 'low', source: 'Revenue' },
                { type: 'news', message: 'Breaking: Audit reveals new discrepancies', severity: 'medium', source: 'Star Tribune' },
                { type: 'fraud', message: 'Identity Theft Ring detected: 12 fake applications', severity: 'critical', source: 'Identity Guard' }
            ];

            const interval = setInterval(() => {
                const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
                const eventData = {
                    id: Math.random().toString(36).substring(7),
                    ...randomEvent,
                    timestamp: new Date().toISOString()
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
            }, 5000 + Math.random() * 5000); // 5-10s random interval

            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        }
    });

    return new Response(customReadable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
