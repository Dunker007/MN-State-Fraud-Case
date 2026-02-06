import { NextRequest, NextResponse } from 'next/server';
import { searchProviders, getProviderById, getGhostOfficeStats } from '@/lib/db/access';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'search';

    try {
        if (action === 'stats') {
            const stats = getGhostOfficeStats();
            return NextResponse.json(stats);
        }

        if (action === 'id') {
            const id = searchParams.get('q');
            if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
            const provider = getProviderById(id);
            return provider ? NextResponse.json(provider) : NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Search Action
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '50');
        const county = searchParams.get('county')?.split(',') || undefined;
        const status = searchParams.get('status')?.split(',') || undefined;

        const results = searchProviders({ query, limit, county, status });
        return NextResponse.json({
            count: results.length,
            results
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
