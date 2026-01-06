import { NextResponse } from 'next/server';
import { getSnapshots, getArticles, getBills, getCourtCases, getCollectionLogs } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'snapshots';
    const limit = parseInt(searchParams.get('limit') || '100');

    try {
        let data: unknown[];

        switch (type) {
            case 'snapshots':
                data = getSnapshots().slice(0, limit);
                break;
            case 'articles':
                data = getArticles().slice(0, limit);
                break;
            case 'bills':
                data = getBills().slice(0, limit);
                break;
            case 'court_cases':
                data = getCourtCases().slice(0, limit);
                break;
            case 'logs':
                data = getCollectionLogs().slice(0, limit);
                break;
            default:
                return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
        );
    }
}
