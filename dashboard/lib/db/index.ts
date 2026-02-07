
/**
 * DATABASE PROVIDER
 * Handles SQLite connection with graceful fallback for production/serverless environments.
 */

let db: any = null;

try {
    // We use a dynamic require to prevent build-time crashes on platforms where better-sqlite3 
    // binary might be missing (like Vercel).
    const Database = require('better-sqlite3');
    const path = require('path');

    // Use an absolute path if possible, or resolve from process.cwd()
    const dbPath = path.resolve(process.cwd(), 'mn-fraud.db');

    db = new Database(dbPath, {
        verbose: process.env.NODE_ENV === 'development' ? console.log : null,
        readonly: true // Safety first in production
    });

    db.pragma('journal_mode = WAL');
    console.log('[DB] Connected to mn-fraud.db');
} catch (error) {
    console.error('[DB] SQLite connection failed. Falling back to JSON Masterlist.', error);
    db = null;
}

export default db;
