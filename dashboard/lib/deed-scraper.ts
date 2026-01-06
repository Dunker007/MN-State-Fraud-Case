import { PaidLeaveSnapshot } from './paid-leave-types';

/**
 * Simulates (or performs) scraping of DEED press releases.
 * In a real environment, this would use fetch() and cheerio to parse HTML.
 * Here, we implement the Regex Logic to find our standard data points.
 */

// Regex Patterns for Intelligence Collection
const PATTERNS = {
    FUND_BALANCE: /\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*million\s*(?:remaining|balance|seed)/i,
    APPLICATIONS: /(\d{1,3}(?:,\d{3})*)\s*applications\s*(?:received|submitted|total)/i,
    APPROVED_COUNT: /(\d{1,3}(?:,\d{3})*)\s*(?:applications|claims)?\s*approved/i,
    PAYOUT_TOTAL: /\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*million\s*paid\s*out/i
};

export async function scrapeDeedPressRelease(url: string): Promise<Partial<PaidLeaveSnapshot> | null> {
    try {
        console.log(`[INTEL] Scraper targeting: ${url}`);

        // Mock Fetch for Demo (since we can't hit external Gov sites reliably from this CLI sometimes)
        // In Prod: const html = await fetch(url).then(r => r.text());
        // We will simulate a "New Press Release" text for demonstration if the URL matches a test pattern.

        let textContent = "";

        if (url.includes('simulation-mode')) {
            textContent = `
                ST. PAUL - The Minnesota Department of Employment and Economic Development (DEED) today announced 
                updated figures for the Paid Leave program. Since launch, the state has received 15,400 applications.
                Of those, 6,200 approved claims have resulted in payments.
                The program has paid out $12.5 million in benefits.
                The seed fund currently has $468.2 million remaining.
            `;
        } else {
            // Real fetch attempt (will likely fail on localhost without proxy, but implemented for "Real" feel)
            // textContent = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0...' } }).then(r => r.text());
            console.log("Real fetch disabled in sandbox. Using simulation.");
            return null;
        }

        // Parse Data
        const balanceMatch = textContent.match(PATTERNS.FUND_BALANCE);
        const appsMatch = textContent.match(PATTERNS.APPLICATIONS);
        const approvedMatch = textContent.match(PATTERNS.APPROVED_COUNT);
        const payoutMatch = textContent.match(PATTERNS.PAYOUT_TOTAL);

        if (!appsMatch && !balanceMatch) {
            console.log("[INTEL] No relevant data patterns found.");
            return null;
        }

        return {
            date: new Date().toISOString().split('T')[0], // Today
            fund_balance_millions: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
            claims_received: appsMatch ? parseInt(appsMatch[1].replace(/,/g, ''), 10) : 0,
            claims_approved: approvedMatch ? parseInt(approvedMatch[1].replace(/,/g, ''), 10) : 0,
            total_payout_millions: payoutMatch ? parseFloat(payoutMatch[1].replace(/,/g, '')) : 0,
            claims_denied: 0, // Not usually published
            claims_pending: 0, // Calc later
            burn_rate_daily_millions: 0, // Calc by Actuary
            notes: "Automated Scrape: Pattern Match",
            source_url: url
        };

    } catch (e) {
        console.error("[INTEL] Scrape failed:", e);
        return null;
    }
}
