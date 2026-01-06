import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PaidLeaveDatabase } from '@/lib/paid-leave-types';
import { scrapeDeedPressRelease } from '@/lib/deed-scraper';

const DB_PATH = path.join(process.cwd(), 'lib/paid-leave-data.json');

export async function POST(req: Request) {
    try {
        const { url } = await req.json().catch(() => ({ url: 'simulation-mode' }));
        const targetUrl = url || 'simulation-mode';

        // 1. Run Scraper
        const newData = await scrapeDeedPressRelease(targetUrl);

        if (!newData) {
            return NextResponse.json({ success: false, message: "Scraper found no data patterns." }, { status: 404 });
        }

        // 2. Load DB
        if (!fs.existsSync(DB_PATH)) {
            return NextResponse.json({ error: 'Database missing' }, { status: 500 });
        }
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const db: PaidLeaveDatabase = JSON.parse(fileContent);

        // 3. Logic: Avoid Duplicate Dates?
        // For now, we allow multiple snapshots per day (e.g. morning/noon update), 
        // but let's check if we already have this exact data to avoid spamming DB.
        const isDuplicate = db.snapshots.some(s =>
            s.date === newData.date &&
            s.claims_received === newData.claims_received
        );

        if (isDuplicate) {
            return NextResponse.json({ success: false, message: "Data already exists in DB." });
        }

        // 4. Complet Data (Pending calc)
        // If we have total and approved, pending is the diff
        const pending = (newData.claims_received || 0) - ((newData.claims_approved || 0) + (newData.claims_denied || 0));

        const snapshot = {
            ...newData,
            claims_pending: pending > 0 ? pending : 0,
            burn_rate_daily_millions: 0 // Will be calc'd on read by Actuary or here? Actuary does it dynamically.
        };

        // 5. Save
        db.snapshots.push(snapshot as any);
        db.meta.last_updated = new Date().toISOString();

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        return NextResponse.json({ success: true, data: snapshot });

    } catch (error) {
        console.error('Scrape API failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
