
import db from './index';
import type { MasterlistEntity, SearchParams, Pagination } from '../types';

/**
 * FALLBACK DATA SOURCE
 * Used when SQLite is unavailable (Production/Serverless/Vercel)
 */
function getFallbackEntities(): any[] {
    try {
        // Use require to load only when needed and avoid circular refs
        const masterlist = require('../masterlist.json');
        return masterlist.entities || [];
    } catch (e) {
        console.error('[FALLBACK] Failed to load JSON masterlist:', e);
        return [];
    }
}

// Cached count for performance
let _totalProviders: number | null = null;

export function getTotalProviders(): number {
    if (_totalProviders === null) {
        if (db) {
            try {
                const stmt = db.prepare('SELECT count(*) as count FROM providers');
                const result = stmt.get() as { count: number };
                _totalProviders = result.count;
            } catch (e) {
                console.error('[DB] Count failed:', e);
                _totalProviders = getFallbackEntities().length;
            }
        } else {
            _totalProviders = getFallbackEntities().length;
        }
    }
    return _totalProviders || 0;
}

export function searchProviders(params: SearchParams): MasterlistEntity[] {
    if (db) {
        try {
            let query = 'SELECT * FROM providers WHERE 1=1';
            const queryParams: (string | number)[] = [];

            if (params.query) {
                query += ' AND (name LIKE ? OR license_id LIKE ? OR city LIKE ?)';
                const like = `%${params.query}%`;
                queryParams.push(like, like, like);
            }

            if (params.county && params.county.length > 0) {
                const placeholders = params.county.map(() => '?').join(',');
                query += ` AND county IN (${placeholders})`;
                queryParams.push(...params.county);
            }

            if (params.status && params.status.length > 0) {
                const placeholders = params.status.map(() => '?').join(',');
                query += ` AND status IN (${placeholders})`;
                queryParams.push(...params.status);
            }

            query += ` LIMIT ?`;
            queryParams.push(params.limit || 50);

            const stmt = db.prepare(query);
            const rows = stmt.all(...queryParams) as any[];

            return rows.map(mapRowToEntity);
        } catch (e) {
            console.error('[DB] Search failed:', e);
        }
    }

    // JSON Fallback
    const entities = getFallbackEntities();
    const query = params.query?.toLowerCase();

    return entities
        .filter(e => {
            if (query && !e.name.toLowerCase().includes(query) && !e.license_id.toLowerCase().includes(query)) return false;
            if (params.county && params.county.length > 0 && !params.county.includes(e.county)) return false;
            if (params.status && params.status.length > 0 && !params.status.includes(e.status)) return false;
            return true;
        })
        .slice(0, params.limit || 50);
}

export function getProviderById(licenseId: string): MasterlistEntity | undefined {
    if (db) {
        try {
            const stmt = db.prepare('SELECT * FROM providers WHERE license_id = ?');
            const row = stmt.get(licenseId);
            return row ? mapRowToEntity(row) : undefined;
        } catch (e) {
            console.error('[DB] GetById failed:', e);
        }
    }

    return getFallbackEntities().find(e => e.license_id === licenseId);
}

export function getGhostOfficeStats() {
    if (db) {
        try {
            const stmt = db.prepare(`
                SELECT count(*) as total, sum(is_ghost_office) as ghosts 
                FROM providers
            `);
            return stmt.get() as { total: number; ghosts: number };
        } catch (e) {
            console.error('[DB] Stats failed:', e);
        }
    }

    const entities = getFallbackEntities();
    return {
        total: entities.length,
        ghosts: entities.filter(e => e.is_ghost_office).length
    };
}

function mapRowToEntity(row: any): MasterlistEntity {
    return {
        license_id: row.license_id,
        name: row.name,
        owner: row.owner,
        status: row.status,
        status_date: row.status_date,
        street: row.street,
        city: row.city,
        zip: row.zip,
        county: row.county,
        service_type: row.service_type,
        is_ghost_office: Boolean(row.is_ghost_office),
        has_curated_data: Boolean(row.has_curated_data)
    };
}

export function getIntelligence(limit: number): any[] {
    if (db) {
        try {
            const stmt = db.prepare('SELECT * FROM intel ORDER BY date DESC LIMIT ?');
            return stmt.all(limit);
        } catch (e) {
            console.error('[DB] Intel failed:', e);
        }
    }
    return []; // No real fallback for intel table yet as it's small/dynamic
}

export function getGeographicClusters(limit: number = 10): { city: string, count: number }[] {
    if (db) {
        try {
            const stmt = db.prepare(`
                SELECT city, count(*) as count 
                FROM providers 
                WHERE city IS NOT NULL AND city != ''
                GROUP BY city 
                ORDER BY count DESC 
                LIMIT ?
            `);
            return stmt.all(limit) as { city: string, count: number }[];
        } catch (e) {
            console.error('[DB] Clusters failed:', e);
        }
    }
    return [];
}

export function getPenaltyBoxCandidates(limit: number = 20): MasterlistEntity[] {
    // 1. Try Database
    if (db) {
        try {
            const stmt = db.prepare(`
                SELECT * FROM providers 
                WHERE 
                    upper(status) LIKE '%REVOKED%' OR 
                    upper(status) LIKE '%SUSPENDED%' OR 
                    upper(status) LIKE '%DENIED%' OR
                    upper(status) LIKE '%CONDITIONAL%'
                ORDER BY 
                    CASE 
                        WHEN upper(status) LIKE '%REVOKED%' THEN 1 
                        WHEN upper(status) LIKE '%DENIED%' THEN 2 
                        WHEN upper(status) LIKE '%SUSPENDED%' THEN 3 
                        ELSE 4 
                    END ASC,
                    status_date DESC 
                LIMIT ?
            `);
            return stmt.all(limit).map(mapRowToEntity);
        } catch (e) {
            console.error('[DB] PenaltyBox query failed:', e);
        }
    }

    // 2. Fallback to JSON (Production/Serverless)
    const entities = getFallbackEntities();

    return entities
        .filter((e: any) => {
            const s = (e.status || '').toUpperCase();
            return s.includes('REVOKED') || s.includes('SUSPENDED') || s.includes('DENIED') || s.includes('CONDITIONAL');
        })
        .sort((a: any, b: any) => {
            const getPriority = (s: string) => {
                const us = s.toUpperCase();
                if (us.includes('REVOKED')) return 1;
                if (us.includes('DENIED')) return 2;
                if (us.includes('SUSPENDED')) return 3;
                return 4;
            };

            const pA = getPriority(a.status);
            const pB = getPriority(b.status);

            if (pA !== pB) return pA - pB;

            // Secondary sort: date
            return new Date(b.status_date || 0).getTime() - new Date(a.status_date || 0).getTime();
        })
        .slice(0, limit);
}
