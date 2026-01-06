import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PaidLeaveDatabase, PaidLeaveSnapshot } from '@/lib/paid-leave-types';

export const dynamic = 'force-dynamic';

const DB_PATH = path.join(process.cwd(), 'lib/paid-leave-data.json');

// Regex patterns to extract data from DEED press releases
const PATTERNS = {
    FUND_BALANCE: /\$?([\d,]+(?:\.\d+)?)\s*million\s*(?:in\s*)?(?:the\s*)?(?:fund|remaining|balance|seed)/i,
    APPLICATIONS: /([\d,]+)\s*(?:applications?|claims?)\s*(?:received|submitted|filed|total)/i,
    APPROVED: /([\d,]+)\s*(?:claims?|applications?)\s*(?:have\s*been\s*)?approved/i,
    PAYOUTS: /\$?([\d,]+(?:\.\d+)?)\s*million\s*(?:in\s*)?(?:benefit\s*)?(?:payments?|paid\s*out|disbursed)/i,
};

async function scrapeDeedNews(): Promise<Partial<PaidLeaveSnapshot> | null> {
    try {
        console.log('[DEED_SCRAPER] Starting scrape of mn.gov/deed/news/');

        const response = await fetch('https://mn.gov/deed/news/', {
            headers: {
                'User-Agent': 'ProjectCrosscheck/1.0 (Research; https://github.com/Dunker007/MN-State-Fraud-Case)',
                'Accept': 'text/html,application/xhtml+xml',
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            console.log(`[DEED_SCRAPER] HTTP ${response.status}: ${response.statusText}`);
            return null;
        }

        const html = await response.text();
        console.log(`[DEED_SCRAPER] Received ${html.length} bytes`);

        // Check for paid leave mentions
        const paidLeaveMatches = html.match(/Paid\s*(?:Family\s*(?:and\s*)?)?Leave/gi);
        if (!paidLeaveMatches || paidLeaveMatches.length === 0) {
            console.log('[DEED_SCRAPER] No paid leave content found');
            return null;
        }

        console.log(`[DEED_SCRAPER] Found ${paidLeaveMatches.length} paid leave mentions`);

        // Extract data points
        const fundMatch = html.match(PATTERNS.FUND_BALANCE);
        const appsMatch = html.match(PATTERNS.APPLICATIONS);
        const approvedMatch = html.match(PATTERNS.APPROVED);
        const payoutMatch = html.match(PATTERNS.PAYOUTS);

        const extracted = {
            fund_balance_millions: fundMatch ? parseFloat(fundMatch[1].replace(/,/g, '')) : undefined,
            claims_received: appsMatch ? parseInt(appsMatch[1].replace(/,/g, ''), 10) : undefined,
            claims_approved: approvedMatch ? parseInt(approvedMatch[1].replace(/,/g, ''), 10) : undefined,
            total_payout_millions: payoutMatch ? parseFloat(payoutMatch[1].replace(/,/g, '')) : undefined,
        };

        console.log('[DEED_SCRAPER] Extracted data:', extracted);

        // Only return if we found at least one data point
        if (extracted.fund_balance_millions || extracted.claims_received || extracted.claims_approved) {
            return {
                date: new Date().toISOString().split('T')[0],
                fund_balance_millions: extracted.fund_balance_millions || 0,
                claims_received: extracted.claims_received || 0,
                claims_approved: extracted.claims_approved || 0,
                claims_denied: 0,
                claims_pending: 0,
                total_payout_millions: extracted.total_payout_millions || 0,
                burn_rate_daily_millions: 0,
                notes: 'Auto-scraped from DEED News',
                source_url: 'https://mn.gov/deed/news/'
            };
        }

        return null;
    } catch (error) {
        console.error('[DEED_SCRAPER] Error:', error);
        return null;
    }
}

function upsertSnapshot(snapshot: PaidLeaveSnapshot): boolean {
    try {
        let db: PaidLeaveDatabase;

        if (fs.existsSync(DB_PATH)) {
            db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        } else {
            db = {
                meta: { last_updated: new Date().toISOString(), version: '1.0' },
                snapshots: []
            };
        }

        // Find existing snapshot for this date
        const existingIndex = db.snapshots.findIndex(s => s.date === snapshot.date);

        if (existingIndex >= 0) {
            // Update existing - merge new data with existing (prefer new non-zero values)
            const existing = db.snapshots[existingIndex];
            db.snapshots[existingIndex] = {
                ...existing,
                fund_balance_millions: snapshot.fund_balance_millions || existing.fund_balance_millions,
                claims_received: snapshot.claims_received || existing.claims_received,
                claims_approved: snapshot.claims_approved || existing.claims_approved,
                claims_denied: snapshot.claims_denied || existing.claims_denied,
                claims_pending: snapshot.claims_pending || existing.claims_pending,
                total_payout_millions: snapshot.total_payout_millions || existing.total_payout_millions,
                burn_rate_daily_millions: snapshot.burn_rate_daily_millions || existing.burn_rate_daily_millions,
                notes: snapshot.notes || existing.notes,
                source_url: snapshot.source_url || existing.source_url,
            };
            console.log(`[DEED_SCRAPER] Updated existing snapshot for ${snapshot.date}`);
        } else {
            // Add new snapshot
            db.snapshots.unshift(snapshot);
            console.log(`[DEED_SCRAPER] Added new snapshot for ${snapshot.date}`);
        }

        // Update metadata
        db.meta.last_updated = new Date().toISOString();

        // Sort by date descending
        db.snapshots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Write back
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        return true;
    } catch (error) {
        console.error('[DEED_SCRAPER] Failed to save snapshot:', error);
        return false;
    }
}

export async function POST() {
    console.log('[DEED_SCRAPER] Scrape triggered via API');

    const scraped = await scrapeDeedNews();

    if (scraped) {
        const saved = upsertSnapshot(scraped as PaidLeaveSnapshot);
        return NextResponse.json({
            success: true,
            message: 'Scrape completed',
            data: scraped,
            saved
        });
    }

    return NextResponse.json({
        success: false,
        message: 'No new data found on DEED site',
        data: null
    });
}

export async function GET() {
    // Allow GET for easy testing
    return POST();
}
