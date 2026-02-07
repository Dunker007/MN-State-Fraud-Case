import db from './index';
import type { MasterlistEntity, SearchParams, Pagination } from '../types';

// Cached count for performance
let _totalProviders: number | null = null;

export function getTotalProviders(): number {
    if (_totalProviders === null) {
        const stmt = db.prepare('SELECT count(*) as count FROM providers');
        const result = stmt.get() as { count: number };
        _totalProviders = result.count;
    }
    return _totalProviders || 0;
}

export function searchProviders(params: SearchParams): MasterlistEntity[] {
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
}

export function getProviderById(licenseId: string): MasterlistEntity | undefined {
    const stmt = db.prepare('SELECT * FROM providers WHERE license_id = ?');
    const row = stmt.get(licenseId);
    return row ? mapRowToEntity(row) : undefined;
}

export function getGhostOfficeStats() {
    const stmt = db.prepare(`
    SELECT count(*) as total, sum(is_ghost_office) as ghosts 
    FROM providers
  `);
    return stmt.get() as { total: number; ghosts: number };
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
    const stmt = db.prepare('SELECT * FROM intel ORDER BY date DESC LIMIT ?');
    return stmt.all(limit);
}

export function getGeographicClusters(limit: number = 10): { city: string, count: number }[] {
    const stmt = db.prepare(`
        SELECT city, count(*) as count 
        FROM providers 
        WHERE city IS NOT NULL AND city != ''
        GROUP BY city 
        ORDER BY count DESC 
        LIMIT ?
    `);
    return stmt.all(limit) as { city: string, count: number }[];
}

export function getPenaltyBoxCandidates(limit: number = 20): MasterlistEntity[] {
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
}
