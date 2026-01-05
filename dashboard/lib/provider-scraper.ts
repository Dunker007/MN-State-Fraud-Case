/**
 * DHS Provider License Scraper
 * 
 * Scrapes individual provider details from MN DHS License Lookup portal.
 * Designed for respectful scraping with delays and retry handling.
 * 
 * Source: https://licensinglookup.dhs.state.mn.us/Details.aspx?l={license_number}
 * 
 * @author Alex Vance - Project CrossCheck
 */

import { MasterlistEntity } from './schemas';

// --- Constants ---
export const DHS_LOOKUP_BASE = 'https://licensinglookup.dhs.state.mn.us/Details.aspx?l=';

// Scraping configuration
const CONFIG = {
    minDelay: 1500,      // 1.5 seconds minimum between requests
    maxDelay: 3000,      // 3 seconds maximum delay
    maxRetries: 3,       // Number of retries on failure
    retryDelay: 5000,    // 5 second wait before retry
    userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    ],
};

// --- Types ---

export interface ScrapedProviderData {
    license_id: string;
    scraped_at: string;          // ISO timestamp
    source_url: string;

    // Core status from DHS
    license_status: 'active' | 'closed' | 'conditional' | 'denied' | 'revoked' | 'suspended' | 'pending' | 'unknown';
    status_date?: string;        // Date of status change if available
    closure_date?: string;       // Specific closure date for closed licenses

    // Violation data
    violation_count: number;
    violation_summary?: string;  // Brief summary of violations
    has_violations: boolean;

    // Additional scraped fields
    program_name?: string;
    service_type?: string;
    capacity?: number;
    address?: string;
    city?: string;
    county?: string;

    // Scrape metadata
    scrape_success: boolean;
    scrape_error?: string;
    raw_html_path?: string;      // Path to archived HTML if stored
}

export interface ScrapeResult {
    success: boolean;
    data?: ScrapedProviderData;
    error?: string;
    retries: number;
}

export interface ScrapeProgress {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    skipped: number;
    currentLicense?: string;
}

// --- Utility Functions ---

function randomDelay(): number {
    return Math.floor(Math.random() * (CONFIG.maxDelay - CONFIG.minDelay + 1)) + CONFIG.minDelay;
}

function getRandomUserAgent(): string {
    return CONFIG.userAgents[Math.floor(Math.random() * CONFIG.userAgents.length)];
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeStatus(rawStatus: string): ScrapedProviderData['license_status'] {
    const status = rawStatus.toLowerCase().trim();

    if (status.includes('active') && !status.includes('conditional')) return 'active';
    if (status.includes('closed') || status.includes('closure')) return 'closed';
    if (status.includes('conditional')) return 'conditional';
    if (status.includes('denied')) return 'denied';
    if (status.includes('revoked')) return 'revoked';
    if (status.includes('suspended')) return 'suspended';
    if (status.includes('pending')) return 'pending';

    return 'unknown';
}

function extractDateFromText(text: string): string | undefined {
    // Match MM/DD/YYYY or MM-DD-YYYY patterns
    const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dateMatch) {
        const [_, month, day, year] = dateMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return undefined;
}

// --- HTML Parsing Functions ---

function parseProviderHtml(html: string, licenseId: string, sourceUrl: string): ScrapedProviderData {
    const now = new Date().toISOString();

    // Initialize base result
    const result: ScrapedProviderData = {
        license_id: licenseId,
        scraped_at: now,
        source_url: sourceUrl,
        license_status: 'unknown',
        violation_count: 0,
        has_violations: false,
        scrape_success: true,
    };

    try {
        // Extract program name
        const nameMatch = html.match(/<span[^>]*id="[^"]*ProgramName[^"]*"[^>]*>([^<]+)<\/span>/i);
        if (nameMatch) {
            result.program_name = nameMatch[1].trim();
        }

        // Extract license status
        const statusMatch = html.match(/<span[^>]*id="[^"]*LicenseStatus[^"]*"[^>]*>([^<]+)<\/span>/i)
            || html.match(/<td[^>]*>License Status[^<]*<\/td>\s*<td[^>]*>([^<]+)<\/td>/i)
            || html.match(/Status[:\s]*<[^>]*>([^<]+)</i);

        if (statusMatch) {
            const rawStatus = statusMatch[1].trim();
            result.license_status = normalizeStatus(rawStatus);
            result.status_date = extractDateFromText(rawStatus);

            // If closed, capture closure date
            if (result.license_status === 'closed') {
                result.closure_date = result.status_date || extractDateFromText(html);
            }
        }

        // Extract service type
        const serviceMatch = html.match(/<span[^>]*id="[^"]*ServiceType[^"]*"[^>]*>([^<]+)<\/span>/i)
            || html.match(/Service Type[:\s]*<[^>]*>([^<]+)</i);
        if (serviceMatch) {
            result.service_type = serviceMatch[1].trim();
        }

        // Extract capacity
        const capacityMatch = html.match(/Capacity[:\s]*<[^>]*>(\d+)/i)
            || html.match(/<span[^>]*id="[^"]*Capacity[^"]*"[^>]*>(\d+)/i);
        if (capacityMatch) {
            result.capacity = parseInt(capacityMatch[1], 10);
        }

        // Extract address
        const addressMatch = html.match(/<span[^>]*id="[^"]*Address[^"]*"[^>]*>([^<]+)<\/span>/i);
        if (addressMatch) {
            result.address = addressMatch[1].trim();
        }

        // Extract city
        const cityMatch = html.match(/<span[^>]*id="[^"]*City[^"]*"[^>]*>([^<]+)<\/span>/i);
        if (cityMatch) {
            result.city = cityMatch[1].trim();
        }

        // Extract county
        const countyMatch = html.match(/<span[^>]*id="[^"]*County[^"]*"[^>]*>([^<]+)<\/span>/i)
            || html.match(/County[:\s]*<[^>]*>([^<]+)</i);
        if (countyMatch) {
            result.county = countyMatch[1].trim();
        }

        // Extract violations section
        const violationsSection = html.match(/Violations?[\s\S]*?<table[\s\S]*?<\/table>/i);
        if (violationsSection) {
            // Count violation rows (excluding header)
            const rowMatches = violationsSection[0].match(/<tr/gi);
            if (rowMatches && rowMatches.length > 1) {
                result.violation_count = rowMatches.length - 1; // Subtract header row
                result.has_violations = true;

                // Extract first violation as summary
                const firstViolation = violationsSection[0].match(/<tr[^>]*>(?:(?!<\/tr>).)*<td[^>]*>([^<]+)<\/td>/i);
                if (firstViolation) {
                    result.violation_summary = firstViolation[1].trim().slice(0, 200);
                }
            }
        }

        // Check for "no violations" indicators
        if (!result.has_violations) {
            const noViolations = html.match(/no\s+violations?\s+found/i)
                || html.match(/0\s+violations?/i)
                || html.match(/violations?[:\s]*none/i);
            if (noViolations) {
                result.violation_count = 0;
                result.has_violations = false;
            }
        }

    } catch (parseError) {
        result.scrape_success = false;
        result.scrape_error = `Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown'}`;
    }

    return result;
}

// --- Main Scraping Function ---

/**
 * Scrape a single provider's details from DHS
 */
export async function scrapeProvider(licenseId: string): Promise<ScrapeResult> {
    const sourceUrl = `${DHS_LOOKUP_BASE}${licenseId}`;
    let retries = 0;

    while (retries <= CONFIG.maxRetries) {
        try {
            const response = await fetch(sourceUrl, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Connection': 'keep-alive',
                },
            });

            if (!response.ok) {
                if (response.status === 429) {
                    // Rate limited - wait longer and retry
                    console.warn(`[Scraper] Rate limited on ${licenseId}, waiting...`);
                    await sleep(CONFIG.retryDelay * 2);
                    retries++;
                    continue;
                }

                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Check for CAPTCHA or block page
            if (html.includes('captcha') || html.includes('blocked') || html.includes('Access Denied')) {
                return {
                    success: false,
                    error: 'CAPTCHA_BLOCK: DHS is blocking automated access',
                    retries,
                };
            }

            // Check for valid content
            if (!html.includes('License') && !html.includes('Provider')) {
                return {
                    success: false,
                    error: 'INVALID_RESPONSE: Page does not contain expected content',
                    retries,
                };
            }

            const data = parseProviderHtml(html, licenseId, sourceUrl);

            return {
                success: data.scrape_success,
                data,
                retries,
            };

        } catch (error) {
            retries++;

            if (retries > CONFIG.maxRetries) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    retries,
                };
            }

            console.warn(`[Scraper] Retry ${retries}/${CONFIG.maxRetries} for ${licenseId}: ${error}`);
            await sleep(CONFIG.retryDelay);
        }
    }

    return {
        success: false,
        error: 'Max retries exceeded',
        retries,
    };
}

/**
 * Batch scrape multiple providers with progress tracking
 */
export async function scrapeProviders(
    licenseIds: string[],
    onProgress?: (progress: ScrapeProgress) => void,
    options: { skipExisting?: boolean; existingIds?: Set<string> } = {}
): Promise<Map<string, ScrapeResult>> {
    const results = new Map<string, ScrapeResult>();
    const existingIds = options.existingIds || new Set<string>();

    const progress: ScrapeProgress = {
        total: licenseIds.length,
        completed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
    };

    for (const licenseId of licenseIds) {
        progress.currentLicense = licenseId;

        // Skip if already scraped and option enabled
        if (options.skipExisting && existingIds.has(licenseId)) {
            progress.skipped++;
            progress.completed++;
            onProgress?.(progress);
            continue;
        }

        // Respect rate limiting with random delay
        await sleep(randomDelay());

        const result = await scrapeProvider(licenseId);
        results.set(licenseId, result);

        if (result.success) {
            progress.successful++;
        } else {
            progress.failed++;
            console.error(`[Scraper] Failed: ${licenseId} - ${result.error}`);
        }

        progress.completed++;
        onProgress?.(progress);
    }

    return results;
}

// --- Data Integration ---

/**
 * Enrich a masterlist entity with scraped data
 */
export function enrichWithScrapedData(
    entity: MasterlistEntity,
    scrapedData: ScrapedProviderData
): MasterlistEntity & { scraped_data?: ScrapedProviderData } {
    return {
        ...entity,
        // Update status if scrape found something different
        status: scrapedData.license_status.toUpperCase() || entity.status,
        status_date: scrapedData.status_date || entity.status_date,
        scraped_data: scrapedData,
    };
}

/**
 * Filter entities that need re-scraping based on last_checked timestamp
 */
export function filterForRescrape(
    entities: MasterlistEntity[],
    lastChecked: Map<string, Date>,
    maxAgeDays: number = 30
): MasterlistEntity[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);

    return entities.filter(entity => {
        const checked = lastChecked.get(entity.license_id);
        return !checked || checked < cutoff;
    });
}

// --- Export Utilities ---

export function generateCsvFromScrapedData(data: ScrapedProviderData[]): string {
    const headers = [
        'license_id',
        'license_status',
        'status_date',
        'closure_date',
        'violation_count',
        'has_violations',
        'violation_summary',
        'program_name',
        'service_type',
        'capacity',
        'county',
        'scraped_at',
        'source_url',
    ];

    const rows = data.map(item => [
        item.license_id,
        item.license_status,
        item.status_date || '',
        item.closure_date || '',
        item.violation_count.toString(),
        item.has_violations ? 'true' : 'false',
        `"${(item.violation_summary || '').replace(/"/g, '""')}"`,
        `"${(item.program_name || '').replace(/"/g, '""')}"`,
        `"${(item.service_type || '').replace(/"/g, '""')}"`,
        item.capacity?.toString() || '',
        item.county || '',
        item.scraped_at,
        item.source_url,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Get summary statistics from scraped data
 */
export function getScrapedStats(data: ScrapedProviderData[]): {
    total: number;
    byStatus: Record<string, number>;
    withViolations: number;
    totalViolations: number;
    closedLicenses: number;
} {
    const byStatus: Record<string, number> = {};
    let withViolations = 0;
    let totalViolations = 0;
    let closedLicenses = 0;

    for (const item of data) {
        byStatus[item.license_status] = (byStatus[item.license_status] || 0) + 1;

        if (item.has_violations) {
            withViolations++;
            totalViolations += item.violation_count;
        }

        if (item.license_status === 'closed') {
            closedLicenses++;
        }
    }

    return {
        total: data.length,
        byStatus,
        withViolations,
        totalViolations,
        closedLicenses,
    };
}
