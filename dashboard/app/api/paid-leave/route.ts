import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PaidLeaveDatabase } from '@/lib/paid-leave-types';

export const dynamic = 'force-dynamic';

const DB_PATH = path.join(process.cwd(), 'lib/paid-leave-data.json');

export async function GET() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const db: PaidLeaveDatabase = JSON.parse(fileContent);

        // Sort snapshots by date descending (newest first)
        db.snapshots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(db);
    } catch (error) {
        console.error('Failed to read paid leave DB:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
