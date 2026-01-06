import { BaseCollector, CollectorResult, sleep, SCRAPE_DELAY_MS } from './base-collector';
import { upsertBill } from '@/lib/database';

// MN Legislature Bill Collector
// Scrapes revisor.mn.gov for paid leave related bills

export class LegislatureCollector extends BaseCollector {
    name = 'LEGISLATURE_COLLECTOR';
    source = 'https://www.revisor.mn.gov/bills/';

    async collect(): Promise<CollectorResult> {
        try {
            let totalCollected = 0;

            // Search for bills with relevant keywords
            const searchUrl = `https://www.revisor.mn.gov/search/?search=keyword&keyword=paid+leave&type=bill`;

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'ProjectCrosscheck/1.0 (Research; https://projectcrosscheck.org)'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Extract bill information using regex
            const billPattern = /(HF|SF)\s*(\d+)/gi;
            const matches = html.matchAll(billPattern);

            const seenBills = new Set<string>();

            for (const match of matches) {
                const billNumber = `${match[1].toUpperCase()}${match[2]}`;

                if (seenBills.has(billNumber)) continue;
                seenBills.add(billNumber);

                upsertBill({
                    bill_number: billNumber,
                    title: `Minnesota ${billNumber}`,
                    status: 'In Committee',
                    url: `https://www.revisor.mn.gov/bills/bill.php?b=${billNumber}`
                });

                totalCollected++;

                await sleep(SCRAPE_DELAY_MS);
            }

            return { success: true, itemsCollected: totalCollected };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, itemsCollected: 0, error: errorMsg };
        }
    }
}

export const legislatureCollector = new LegislatureCollector();
