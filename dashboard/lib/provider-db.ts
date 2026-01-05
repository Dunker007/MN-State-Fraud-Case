/**
 * Provider Database - Simple JSON-based storage for provider data
 * 
 * Uses a straightforward JSON file structure that can be queried/filtered
 * for the frontend. Designed for easy migration to SQLite or PostgreSQL later.
 * 
 * Natural key: license_id
 * 
 * @author Alex Vance - Project CrossCheck
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ScrapedProviderData, getScrapedStats } from './provider-scraper';
import { MasterlistEntity } from './schemas';

// --- Types ---

export interface ProviderRecord {
    // Core identification (natural key)
    license_id: string;

    // From GeoSpatial Commons / Masterlist
    name: string;
    owner?: string;
    street?: string;
    city?: string;
    zip?: string;
    county?: string;
    phone?: string;
    service_type?: string;

    // Status tracking
    status: string;
    status_date?: string;
    is_closed: boolean;
    closure_date?: string;

    // Violation data
    violation_count: number;
    violation_summary?: string;
    has_violations: boolean;

    // Capacity (for child care)
    capacity?: number;

    // Audit trail
    source_url: string;
    first_seen: string;      // When first added to our DB
    last_checked: string;    // Last scrape timestamp
    last_updated: string;    // Last time any field changed

    // Flags for analysis
    is_ghost_office?: boolean;
    has_curated_data?: boolean;
    needs_review?: boolean;
}

export interface ProviderDatabase {
    meta: {
        version: string;
        last_full_refresh: string;
        record_count: number;
        closed_count: number;
        violation_count: number;
    };
    providers: Record<string, ProviderRecord>;  // Keyed by license_id
}

export interface ProviderQueryOptions {
    status?: string | string[];
    county?: string | string[];
    hasViolations?: boolean;
    isClosed?: boolean;
    minViolationCount?: number;
    serviceType?: string | string[];
    sortBy?: keyof ProviderRecord;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

// --- Constants ---

const DB_FILE_PATH = path.join(process.cwd(), 'lib', 'provider_db.json');
const DB_BACKUP_PATH = path.join(process.cwd(), 'lib', 'provider_db.bak.json');
const DB_VERSION = '1.0.0';

// --- Database Operations ---

/**
 * Initialize a new empty database
 */
export function createEmptyDatabase(): ProviderDatabase {
    return {
        meta: {
            version: DB_VERSION,
            last_full_refresh: new Date().toISOString(),
            record_count: 0,
            closed_count: 0,
            violation_count: 0,
        },
        providers: {},
    };
}

/**
 * Load the database from disk
 */
export async function loadDatabase(): Promise<ProviderDatabase> {
    try {
        const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
        return JSON.parse(data) as ProviderDatabase;
    } catch (error) {
        // If file doesn't exist, create a new one
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            const newDb = createEmptyDatabase();
            await saveDatabase(newDb);
            return newDb;
        }
        throw error;
    }
}

/**
 * Save the database to disk with backup
 */
export async function saveDatabase(db: ProviderDatabase): Promise<void> {
    // Update metadata
    db.meta.record_count = Object.keys(db.providers).length;
    db.meta.closed_count = Object.values(db.providers).filter(p => p.is_closed).length;
    db.meta.violation_count = Object.values(db.providers).reduce((sum, p) => sum + p.violation_count, 0);

    // Create backup of existing file
    try {
        await fs.access(DB_FILE_PATH);
        await fs.copyFile(DB_FILE_PATH, DB_BACKUP_PATH);
    } catch {
        // No existing file to backup
    }

    // Write new data
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

/**
 * Convert a masterlist entity to a provider record
 */
export function masterlistToProviderRecord(entity: MasterlistEntity): ProviderRecord {
    const now = new Date().toISOString();
    const isClosed = entity.status?.toLowerCase() === 'closed';

    return {
        license_id: entity.license_id,
        name: entity.name,
        owner: entity.owner || undefined,
        street: entity.street || undefined,
        city: entity.city || undefined,
        zip: entity.zip || undefined,
        county: entity.county || undefined,
        phone: entity.phone || undefined,
        service_type: entity.service_type || undefined,
        status: entity.status || 'unknown',
        status_date: entity.status_date || undefined,
        is_closed: isClosed,
        closure_date: isClosed ? entity.status_date : undefined,
        violation_count: 0,
        has_violations: false,
        source_url: `https://licensinglookup.dhs.state.mn.us/Details.aspx?l=${entity.license_id}`,
        first_seen: now,
        last_checked: now,
        last_updated: now,
        is_ghost_office: entity.is_ghost_office,
        has_curated_data: entity.has_curated_data,
    };
}

/**
 * Update a provider record with scraped data
 */
export function updateWithScrapedData(
    record: ProviderRecord,
    scraped: ScrapedProviderData
): ProviderRecord {
    const now = new Date().toISOString();
    const hasChanges =
        record.status !== scraped.license_status.toUpperCase() ||
        record.violation_count !== scraped.violation_count ||
        record.is_closed !== (scraped.license_status === 'closed');

    return {
        ...record,
        status: scraped.license_status.toUpperCase(),
        status_date: scraped.status_date || record.status_date,
        is_closed: scraped.license_status === 'closed',
        closure_date: scraped.closure_date || record.closure_date,
        violation_count: scraped.violation_count,
        violation_summary: scraped.violation_summary || record.violation_summary,
        has_violations: scraped.has_violations,
        capacity: scraped.capacity || record.capacity,
        last_checked: now,
        last_updated: hasChanges ? now : record.last_updated,
        needs_review: hasChanges ? true : record.needs_review,
    };
}

/**
 * Upsert a provider record
 */
export function upsertProvider(db: ProviderDatabase, record: ProviderRecord): void {
    const existing = db.providers[record.license_id];

    if (existing) {
        // Preserve first_seen from original record
        record.first_seen = existing.first_seen;
    }

    db.providers[record.license_id] = record;
}

/**
 * Bulk import from masterlist
 */
export async function importFromMasterlist(
    entities: MasterlistEntity[],
    db?: ProviderDatabase
): Promise<ProviderDatabase> {
    const database = db || await loadDatabase();

    for (const entity of entities) {
        const record = masterlistToProviderRecord(entity);

        // Check if we already have this record
        const existing = database.providers[entity.license_id];
        if (existing) {
            // Update but preserve scrape data
            database.providers[entity.license_id] = {
                ...existing,
                // Update fields from masterlist
                name: entity.name,
                owner: entity.owner || existing.owner,
                street: entity.street || existing.street,
                city: entity.city || existing.city,
                zip: entity.zip || existing.zip,
                county: entity.county || existing.county,
                phone: entity.phone || existing.phone,
                service_type: entity.service_type || existing.service_type,
                last_updated: new Date().toISOString(),
            };
        } else {
            database.providers[entity.license_id] = record;
        }
    }

    database.meta.last_full_refresh = new Date().toISOString();
    await saveDatabase(database);

    return database;
}

// --- Query Functions ---

/**
 * Query providers with filtering and sorting
 */
export function queryProviders(
    db: ProviderDatabase,
    options: ProviderQueryOptions = {}
): ProviderRecord[] {
    let results = Object.values(db.providers);

    // Filter by status
    if (options.status) {
        const statuses = Array.isArray(options.status)
            ? options.status.map(s => s.toLowerCase())
            : [options.status.toLowerCase()];
        results = results.filter(p => statuses.includes(p.status.toLowerCase()));
    }

    // Filter by county
    if (options.county) {
        const counties = Array.isArray(options.county)
            ? options.county.map(c => c.toLowerCase())
            : [options.county.toLowerCase()];
        results = results.filter(p => p.county && counties.includes(p.county.toLowerCase()));
    }

    // Filter by service type
    if (options.serviceType) {
        const types = Array.isArray(options.serviceType)
            ? options.serviceType.map(t => t.toLowerCase())
            : [options.serviceType.toLowerCase()];
        results = results.filter(p =>
            p.service_type && types.some(t => p.service_type!.toLowerCase().includes(t))
        );
    }

    // Filter by violations
    if (options.hasViolations !== undefined) {
        results = results.filter(p => p.has_violations === options.hasViolations);
    }

    if (options.minViolationCount !== undefined) {
        results = results.filter(p => p.violation_count >= options.minViolationCount!);
    }

    // Filter by closed status
    if (options.isClosed !== undefined) {
        results = results.filter(p => p.is_closed === options.isClosed);
    }

    // Sort
    if (options.sortBy) {
        const sortKey = options.sortBy;
        const order = options.sortOrder === 'desc' ? -1 : 1;

        results.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];

            if (aVal === undefined && bVal === undefined) return 0;
            if (aVal === undefined) return 1;
            if (bVal === undefined) return -1;

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return (aVal - bVal) * order;
            }

            return String(aVal).localeCompare(String(bVal)) * order;
        });
    }

    // Pagination
    const offset = options.offset || 0;
    const limit = options.limit;

    if (limit) {
        results = results.slice(offset, offset + limit);
    } else if (offset) {
        results = results.slice(offset);
    }

    return results;
}

/**
 * Get providers that need re-scraping
 */
export function getProvidersNeedingScrape(
    db: ProviderDatabase,
    maxAgeDays: number = 30
): ProviderRecord[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);

    return Object.values(db.providers).filter(p => {
        const lastChecked = new Date(p.last_checked);
        return lastChecked < cutoff;
    });
}

/**
 * Get closed licenses summary
 */
export function getClosedLicensesSummary(db: ProviderDatabase): {
    total: number;
    byCounty: Record<string, number>;
    byServiceType: Record<string, number>;
    recentClosures: ProviderRecord[];
} {
    const closed = Object.values(db.providers).filter(p => p.is_closed);

    const byCounty: Record<string, number> = {};
    const byServiceType: Record<string, number> = {};

    for (const p of closed) {
        if (p.county) {
            byCounty[p.county] = (byCounty[p.county] || 0) + 1;
        }
        if (p.service_type) {
            byServiceType[p.service_type] = (byServiceType[p.service_type] || 0) + 1;
        }
    }

    // Get most recent closures
    const recentClosures = closed
        .filter(p => p.closure_date)
        .sort((a, b) =>
            new Date(b.closure_date!).getTime() - new Date(a.closure_date!).getTime()
        )
        .slice(0, 20);

    return {
        total: closed.length,
        byCounty,
        byServiceType,
        recentClosures,
    };
}

/**
 * Get high-violation providers
 */
export function getHighViolationProviders(
    db: ProviderDatabase,
    minViolations: number = 3
): ProviderRecord[] {
    return Object.values(db.providers)
        .filter(p => p.violation_count >= minViolations)
        .sort((a, b) => b.violation_count - a.violation_count);
}

/**
 * Get database statistics
 */
export function getDatabaseStats(db: ProviderDatabase): {
    totalProviders: number;
    activeCount: number;
    closedCount: number;
    withViolations: number;
    totalViolations: number;
    byStatus: Record<string, number>;
    byCounty: Record<string, number>;
    lastRefresh: string;
    needsScrape: number;
} {
    const providers = Object.values(db.providers);

    const byStatus: Record<string, number> = {};
    const byCounty: Record<string, number> = {};
    let withViolations = 0;
    let totalViolations = 0;
    let activeCount = 0;
    let closedCount = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let needsScrape = 0;

    for (const p of providers) {
        // Status counts
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;

        if (p.status.toLowerCase() === 'active') activeCount++;
        if (p.is_closed) closedCount++;

        // County counts
        if (p.county) {
            byCounty[p.county] = (byCounty[p.county] || 0) + 1;
        }

        // Violation counts
        if (p.has_violations) {
            withViolations++;
            totalViolations += p.violation_count;
        }

        // Check if needs scrape
        if (new Date(p.last_checked) < thirtyDaysAgo) {
            needsScrape++;
        }
    }

    return {
        totalProviders: providers.length,
        activeCount,
        closedCount,
        withViolations,
        totalViolations,
        byStatus,
        byCounty,
        lastRefresh: db.meta.last_full_refresh,
        needsScrape,
    };
}

/**
 * Export database to CSV
 */
export function exportToCsv(db: ProviderDatabase): string {
    const headers = [
        'license_id',
        'name',
        'owner',
        'status',
        'status_date',
        'is_closed',
        'closure_date',
        'violation_count',
        'has_violations',
        'violation_summary',
        'street',
        'city',
        'zip',
        'county',
        'phone',
        'service_type',
        'capacity',
        'source_url',
        'first_seen',
        'last_checked',
        'last_updated',
    ];

    const rows = Object.values(db.providers).map(p => [
        p.license_id,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.owner || '').replace(/"/g, '""')}"`,
        p.status,
        p.status_date || '',
        p.is_closed ? 'true' : 'false',
        p.closure_date || '',
        p.violation_count.toString(),
        p.has_violations ? 'true' : 'false',
        `"${(p.violation_summary || '').replace(/"/g, '""')}"`,
        `"${(p.street || '').replace(/"/g, '""')}"`,
        `"${(p.city || '').replace(/"/g, '""')}"`,
        p.zip || '',
        p.county || '',
        p.phone || '',
        `"${(p.service_type || '').replace(/"/g, '""')}"`,
        p.capacity?.toString() || '',
        p.source_url,
        p.first_seen,
        p.last_checked,
        p.last_updated,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
}
