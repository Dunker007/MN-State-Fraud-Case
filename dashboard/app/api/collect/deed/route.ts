import { NextResponse } from 'next/server';
import { deedCollector } from '@/lib/collectors/deed-collector';

export const dynamic = 'force-dynamic';

// Trigger DEED collection
export async function POST(request: Request) {
    try {
        const result = await deedCollector.run();

        return NextResponse.json({
            success: result.success,
            collector: deedCollector.name,
            itemsCollected: result.itemsCollected,
            error: result.error,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('DEED Collection error:', error);
        return NextResponse.json(
            { success: false, error: 'Collection failed' },
            { status: 500 }
        );
    }
}

// Get collection status
export async function GET() {
    return NextResponse.json({
        collector: deedCollector.name,
        source: deedCollector.source,
        status: 'ready',
        lastRun: null // Would query from logs
    });
}
