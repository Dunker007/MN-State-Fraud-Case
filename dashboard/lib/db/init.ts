import db from './index';
// Import raw data dumps
import masterlistRaw from '../masterlist.json';
import manifestRaw from '../evidence_manifest.json';
// Import forensic JSON if available or mock
import forensicReportRaw from '../evidence_dump.json';

const BATCH_SIZE = 500;

export async function initDatabase() {
    console.log('Initializing database tables...');

    // Providers Table (Full Masterlist)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS providers (
            license_id TEXT PRIMARY KEY,
            name TEXT,
            owner TEXT,
            status TEXT,
            status_date TEXT,
            street TEXT,
            city TEXT,
            zip TEXT,
            county TEXT,
            service_type TEXT,
            is_ghost_office INTEGER DEFAULT 0,
            has_curated_data INTEGER DEFAULT 0,
            risk_score INTEGER DEFAULT 0
        )
    `).run();

    // Evidence Table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS evidence (
            id TEXT PRIMARY KEY,
            title TEXT,
            type TEXT,
            description TEXT,
            path TEXT,
            url TEXT,
            size TEXT
        )
    `).run();

    // Intelligence Table (News/Social) - for the Daily Hunter
    db.prepare(`
        CREATE TABLE IF NOT EXISTS intel (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT,
            headline TEXT,
            summary TEXT,
            url TEXT,
            date TEXT,
            relevance_score INTEGER
        )
    `).run();

    console.log('Tables created. Checking data...');

    const providerCount = db.prepare('SELECT count(*) as count FROM providers').get() as { count: number };

    if (providerCount?.count < 100) {
        console.log('Seeding provider data from JSON...');
        const insertProvider = db.prepare(`
            INSERT OR REPLACE INTO providers (
                license_id, name, owner, status, status_date, 
                street, city, zip, county, service_type,
                is_ghost_office, has_curated_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Batch insert raw providers
        const providers = (masterlistRaw as any).entities || [];
        const transaction = db.transaction((batch) => {
            for (const p of batch) {
                insertProvider.run(
                    p.license_id, p.name, p.owner || 'UNKNOWN', p.status, p.status_date || null,
                    p.street || '', p.city || '', p.zip || '', p.county || '', p.service_type || '',
                    p.is_ghost_office ? 1 : 0, p.has_curated_data ? 1 : 0
                );
            }
        });

        for (let i = 0; i < providers.length; i += BATCH_SIZE) {
            transaction(providers.slice(i, i + BATCH_SIZE));
            console.log(`Inserted ${Math.min(i + BATCH_SIZE, providers.length)} / ${providers.length} providers`);
        }
    } else {
        console.log(`Database already seeded with ${providerCount.count} providers.`);
    }

    console.log('Database initialization complete.');
}

if (require.main === module) {
    initDatabase().catch(console.error);
}
