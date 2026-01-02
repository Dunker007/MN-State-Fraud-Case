/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Masterlist Updater
 * 
 * 1. Reads existing lib/masterlist.json
 * 2. Scans project root for DHS export CSVs (Licensing_Lookup_*.csv)
 * 3. Merges CSV data (owners, better addresses) into masterlist
 * 4. Deduplicates and saves back to lib/masterlist.json
 * 
 * Usage: node scripts/update_masterlist.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const MASTERLIST_PATH = path.join(__dirname, '..', 'lib', 'masterlist.json');

// --- Helper Functions ---

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result;
}

function parseCSV(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((h, idx) => {
                row[h.trim()] = values[idx]?.trim() || '';
            });
            rows.push(row);
        }
    }
    return rows;
}

// --- Main Execution ---

console.log('🔄 Starting Data Merge...');

// 1. Load Masterlist
let masterlist;
try {
    masterlist = JSON.parse(fs.readFileSync(MASTERLIST_PATH, 'utf-8'));
    console.log(`✅ Loaded existing masterlist: ${masterlist.entities.length.toLocaleString()} entities`);
} catch {
    console.log('⚠️ No existing masterlist found or error reading. Starting fresh.');
    masterlist = { meta: {}, entities: [] };
}

// Map for O(1) lookups
const entityMap = new Map();
masterlist.entities.forEach(e => entityMap.set(e.license_id, e));

// 2. Find CSVs
const csvFiles = fs.readdirSync(PROJECT_ROOT)
    .filter(f => f.endsWith('.csv') && f.includes('Licensing_Lookup'))
    .map(f => path.join(PROJECT_ROOT, f));

console.log(`🔍 Found ${csvFiles.length} new CSV export files to merge:`);
csvFiles.forEach(f => console.log(`   - ${path.basename(f)}`));

// 3. Process CSVs
let newEntitiesCount = 0;
let updatedEntitiesCount = 0;

csvFiles.forEach(csvFile => {
    const content = fs.readFileSync(csvFile, 'utf-8');
    const rows = parseCSV(content);

    rows.forEach(row => {
        const licenseId = row['License Number'];
        if (!licenseId) return;

        // Parse fields
        let status = row['License Status'] || 'Unknown';
        let statusDate = '';
        const dateMatch = status.match(/as of\s+(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch) {
            statusDate = dateMatch[1];
            status = status.replace(/\s+as of\s+\d{2}\/\d{2}\/\d{4}/, '').trim();
        }

        const street = [row['AddressLine1'], row['AddressLine2'], row['AddressLine3']]
            .filter(a => a && a.trim())
            .join(', ');

        const owner = row['License Holder'] || '';
        const isGhostOffice = !street || street.length < 5 || street.includes('County');

        // New Data Object
        const newData = {
            license_id: licenseId,
            name: row['Name of Program'] || '',
            owner: owner,
            status: status,
            status_date: statusDate || '',
            street: street,
            city: row['City'] || '',
            zip: row['Zip'] || '',
            phone: row['Phone'] || '',
            county: row['County'] || '',
            service_type: row['License Type'] || '',
            is_ghost_office: isGhostOffice
        };

        // Merge Logic
        if (entityMap.has(licenseId)) {
            // Update existing
            const existing = entityMap.get(licenseId);
            let changed = false;

            // Always trust CSV owner if it exists
            if (newData.owner && (!existing.owner || existing.owner === '' || existing.owner === existing.name)) {
                existing.owner = newData.owner;
                changed = true;
            }
            // Trust CSV address if existing is blank or ghost-like
            if (newData.street && (!existing.street || existing.street.length < 5)) {
                existing.street = newData.street;
                existing.is_ghost_office = isGhostOffice;
                changed = true;
            }
            // Update status if new one looks valid and current is missing? 
            // Actually, keep the most specific status. 
            // For now, let's just update owner and address which are the high value CSV adds.

            if (changed) updatedEntitiesCount++;
        } else {
            // Add new
            entityMap.set(licenseId, {
                ...newData,
                has_curated_data: false // New from CSV, likely not curated
            });
            newEntitiesCount++;
        }
    });
});

// 4. Save
const finalEntities = Array.from(entityMap.values());

// Recalculate stats
const withOwner = finalEntities.filter(e => e.owner && e.owner.length > 0).length;
const ghostOffices = finalEntities.filter(e => e.is_ghost_office).length;
const statusCounts = {};
finalEntities.forEach(e => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
});

const output = {
    meta: {
        ...masterlist.meta,
        generated: new Date().toISOString(),
        total_entities: finalEntities.length,
        with_owner: withOwner,
        ghost_offices_count: ghostOffices,
        status_counts: statusCounts,
        csv_merge_count: csvFiles.length
    },
    entities: finalEntities
};

fs.writeFileSync(MASTERLIST_PATH, JSON.stringify(output, null, 2));

console.log(`\n🎉 Merge Complete!`);
console.log(`   Total Entities: ${finalEntities.length.toLocaleString()}`);
console.log(`   New Entities Added: ${newEntitiesCount.toLocaleString()}`);
console.log(`   Entities Updated: ${updatedEntitiesCount.toLocaleString()} (Owner/Address enriched)`);
console.log(`   Total With Owner: ${withOwner.toLocaleString()}`);
console.log(`   Ghost Offices: ${ghostOffices.toLocaleString()}`);
console.log(`\n💾 Updates saved to ${MASTERLIST_PATH}`);
