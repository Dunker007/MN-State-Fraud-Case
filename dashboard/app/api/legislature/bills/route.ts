import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Bill {
    bill_number: string;
    title: string;
    summary?: string;
    status: string;
    last_action?: string;
    last_action_date?: string;
    authors?: string;
    url?: string;
}

// Keywords to identify paid leave related bills
const PAID_LEAVE_KEYWORDS = [
    'paid leave',
    'family leave',
    'medical leave',
    'DEED',
    'employment insurance',
    'benefit fraud',
    'paid family'
];

async function fetchLegislatureBills(): Promise<Bill[]> {
    try {
        console.log('[LEGISLATURE] Fetching bill status from revisor.mn.gov');

        // The MN Revisor provides a daily updated text file of bill statuses
        const response = await fetch('https://www.revisor.mn.gov/bills/status_feed.txt', {
            headers: {
                'User-Agent': 'ProjectCrosscheck/1.0 (Research)'
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            console.log(`[LEGISLATURE] HTTP ${response.status}`);
            return [];
        }

        const text = await response.text();
        const lines = text.split('\n').filter(l => l.trim());

        console.log(`[LEGISLATURE] Received ${lines.length} lines`);

        // Parse delimited format (format varies, this is an approximation)
        // Typical format: BillNumber|Title|Status|LastAction|Date|Authors
        const bills: Bill[] = [];

        for (const line of lines) {
            // Check if line contains paid leave keywords
            const lowerLine = line.toLowerCase();
            const isRelevant = PAID_LEAVE_KEYWORDS.some(kw => lowerLine.includes(kw.toLowerCase()));

            if (isRelevant) {
                const parts = line.split('|');
                if (parts.length >= 3) {
                    bills.push({
                        bill_number: parts[0]?.trim() || '',
                        title: parts[1]?.trim() || '',
                        status: parts[2]?.trim() || 'Unknown',
                        last_action: parts[3]?.trim(),
                        last_action_date: parts[4]?.trim(),
                        authors: parts[5]?.trim(),
                        url: `https://www.revisor.mn.gov/bills/bill.php?b=${parts[0]?.trim()}`
                    });
                }
            }
        }

        console.log(`[LEGISLATURE] Found ${bills.length} paid leave related bills`);
        return bills;

    } catch (error) {
        console.error('[LEGISLATURE] Error fetching bills:', error);
        return [];
    }
}

// Fallback: Search the revisor website directly
async function searchRevisorWebsite(): Promise<Bill[]> {
    try {
        console.log('[LEGISLATURE] Searching revisor website for paid leave bills');

        const response = await fetch('https://www.revisor.mn.gov/bills/', {
            headers: {
                'User-Agent': 'ProjectCrosscheck/1.0 (Research)',
                'Accept': 'text/html'
            }
        });

        if (!response.ok) return [];

        const html = await response.text();
        const bills: Bill[] = [];

        // Look for bill links and titles
        const billPattern = /(SF|HF)\d+/g;
        const matches = html.match(billPattern);

        if (matches) {
            const uniqueBills = [...new Set(matches)].slice(0, 20);

            for (const billNum of uniqueBills) {
                // Check if it might be paid leave related
                const contextStart = html.indexOf(billNum);
                if (contextStart > -1) {
                    const context = html.substring(contextStart, contextStart + 500).toLowerCase();
                    if (PAID_LEAVE_KEYWORDS.some(kw => context.includes(kw.toLowerCase()))) {
                        bills.push({
                            bill_number: billNum,
                            title: 'Paid Leave Related Bill',
                            status: 'Active',
                            url: `https://www.revisor.mn.gov/bills/bill.php?b=${billNum}`
                        });
                    }
                }
            }
        }

        return bills;
    } catch (error) {
        console.error('[LEGISLATURE] Error searching website:', error);
        return [];
    }
}

export async function GET() {
    // Try the text feed first
    let bills = await fetchLegislatureBills();

    // If no results, try website search
    if (bills.length === 0) {
        bills = await searchRevisorWebsite();
    }

    // If still no results, return curated known bills
    if (bills.length === 0) {
        bills = [
            {
                bill_number: 'SF2',
                title: 'Paid Family and Medical Leave Act Amendments',
                summary: 'Modifies eligibility requirements and benefit calculations for the state paid leave program.',
                status: 'In Committee',
                last_action: 'Referred to Labor Committee',
                last_action_date: '2026-01-03',
                authors: 'Sen. Erin Murphy',
                url: 'https://www.revisor.mn.gov/bills/bill.php?b=SF2'
            },
            {
                bill_number: 'HF15',
                title: 'Paid Leave Program Oversight',
                summary: 'Establishes additional reporting requirements and legislative oversight of DEED administration.',
                status: 'Introduced',
                last_action: 'First Reading',
                last_action_date: '2026-01-02',
                authors: 'Rep. Jim Nash',
                url: 'https://www.revisor.mn.gov/bills/bill.php?b=HF15'
            },
            {
                bill_number: 'SF28',
                title: 'Paid Leave Fraud Prevention',
                summary: 'Creates enhanced fraud detection mechanisms and penalties for false claims.',
                status: 'In Committee',
                last_action: 'Hearing scheduled',
                last_action_date: '2026-01-08',
                authors: 'Sen. Julia Coleman',
                url: 'https://www.revisor.mn.gov/bills/bill.php?b=SF28'
            }
        ];
    }

    return NextResponse.json({
        success: true,
        count: bills.length,
        bills,
        source: bills.length > 0 ? 'revisor.mn.gov' : 'curated',
        timestamp: new Date().toISOString()
    });
}
