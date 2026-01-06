import { BaseCollector, CollectorResult } from './base-collector';
import { upsertSnapshot } from '@/lib/database';

// DEED Press Release Collector
// Scrapes mn.gov/deed/news for Paid Leave announcements

export class DeedCollector extends BaseCollector {
    name = 'DEED_COLLECTOR';
    source = 'https://mn.gov/deed/news/';

    // Regex patterns to extract data from DEED press releases
    private patterns = {
        fundBalance: /\$?([\d,]+(?:\.\d+)?)\s*(?:million|M)\s*(?:in\s*)?(?:the\s*)?(?:fund|remaining|balance)/i,
        applications: /([\d,]+)\s*(?:applications?|claims?)\s*(?:received|submitted|filed)/i,
        approved: /([\d,]+)\s*(?:claims?|applications?)\s*(?:have\s*been\s*)?approved/i,
        payouts: /\$?([\d,]+(?:\.\d+)?)\s*(?:million|M)\s*(?:in\s*)?(?:benefit\s*)?(?:payments?|paid\s*out|disbursed)/i,
    };

    async collect(): Promise<CollectorResult> {
        try {
            // Fetch the DEED news page
            const response = await fetch(this.source, {
                headers: {
                    'User-Agent': 'ProjectCrosscheck/1.0 (Research; https://projectcrosscheck.org)'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Look for paid leave related articles
            const paidLeaveMatches = html.match(/Paid\s*(?:Family\s*(?:and\s*)?)?Leave/gi);
            if (!paidLeaveMatches || paidLeaveMatches.length === 0) {
                return { success: true, itemsCollected: 0 };
            }

            // Extract data from the page
            const extractedData = this.extractData(html);

            if (extractedData.hasData) {
                const today = new Date().toISOString().split('T')[0];

                upsertSnapshot({
                    date: today,
                    fund_balance_millions: extractedData.fundBalance || 0,
                    claims_received: extractedData.applications || 0,
                    claims_approved: extractedData.approved || 0,
                    total_payout_millions: extractedData.payouts || 0,
                    notes: `Auto-scraped from DEED`,
                    source: this.source
                });

                return { success: true, itemsCollected: 1 };
            }

            return { success: true, itemsCollected: 0 };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, itemsCollected: 0, error: errorMsg };
        }
    }

    private extractData(html: string) {
        let fundBalance: number | null = null;
        let applications: number | null = null;
        let approved: number | null = null;
        let payouts: number | null = null;

        // Fund Balance
        const fundMatch = html.match(this.patterns.fundBalance);
        if (fundMatch) {
            fundBalance = parseFloat(fundMatch[1].replace(/,/g, ''));
        }

        // Applications
        const appMatch = html.match(this.patterns.applications);
        if (appMatch) {
            applications = parseInt(appMatch[1].replace(/,/g, ''), 10);
        }

        // Approved
        const approvedMatch = html.match(this.patterns.approved);
        if (approvedMatch) {
            approved = parseInt(approvedMatch[1].replace(/,/g, ''), 10);
        }

        // Payouts
        const payoutMatch = html.match(this.patterns.payouts);
        if (payoutMatch) {
            payouts = parseFloat(payoutMatch[1].replace(/,/g, ''));
        }

        return {
            fundBalance,
            applications,
            approved,
            payouts,
            hasData: fundBalance !== null || applications !== null || approved !== null || payouts !== null
        };
    }
}

// Export singleton
export const deedCollector = new DeedCollector();
