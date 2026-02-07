
import db from '../lib/db';
import { getPenaltyBoxCandidates } from '../lib/db/access';

console.log('--- CHECKING PENALTY BOX CANDIDATES ---');

try {
    const candidates = getPenaltyBoxCandidates(5);
    console.log(`Found ${candidates.length} candidates.`);
    if (candidates.length > 0) {
        console.log('Sample candidate:', candidates[0]);
    } else {
        // Debug query count directly
        const count = db.prepare(`SELECT count(*) as c FROM providers WHERE status IN ('REVOKED', 'SUSPENDED', 'DENIED', 'CONDITIONAL')`).get() as any;
        console.log('Total matching rows in DB:', count.c);

        // Debug all distinct statuses
        const statuses = db.prepare('SELECT DISTINCT status FROM providers').all();
        console.log('Available statuses:', statuses);
    }
} catch (error) {
    console.error('Error fetching candidates:', error);
}
