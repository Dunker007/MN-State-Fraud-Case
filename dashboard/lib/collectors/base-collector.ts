import { logCollection } from '@/lib/database';

export interface CollectorResult {
    success: boolean;
    itemsCollected: number;
    error?: string;
}

export abstract class BaseCollector {
    abstract name: string;
    abstract source: string;

    // Must be implemented by each collector
    abstract collect(): Promise<CollectorResult>;

    // Run with logging
    async run(): Promise<CollectorResult> {
        console.log(`[${this.name}] Starting collection from ${this.source}...`);

        try {
            const result = await this.collect();

            logCollection(
                this.name,
                result.success ? 'success' : 'failed',
                result.itemsCollected,
                result.error
            );

            console.log(`[${this.name}] Completed: ${result.itemsCollected} items collected`);
            return result;

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';

            logCollection(this.name, 'error', 0, errorMsg);

            console.error(`[${this.name}] Error: ${errorMsg}`);
            return { success: false, itemsCollected: 0, error: errorMsg };
        }
    }
}

// Rate limiting helper
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Respectful scraping - always add delay between requests
export const SCRAPE_DELAY_MS = 2000; // 2 seconds between requests
