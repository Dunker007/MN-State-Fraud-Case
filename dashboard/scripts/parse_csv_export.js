/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * CSV Parser for DHS Licensing Lookup Export
 * Uses the structured CSV export which includes License Holder (owner) names
 * 
 * Usage: node scripts/parse_csv_export.js
 */

const fs = require('fs');
const path = require('path');

// Input: All CSV files in the main project folder
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const OUTPUT_JSON = path.join(__dirname, '..', 'lib', 'masterlist_from_csv.json');
const OUTPUT_CSV = path.join(__dirname, '..', 'lib', 'masterlist_from_csv.csv');

// Find all CSV files
const csvFiles = fs.readdirSync(PROJECT_ROOT)
    .filter(f => f.endsWith('.csv') && f.includes('Licensing_Lookup'))
    .map(f => path.join(PROJECT_ROOT, f));

console.log(`🔍 Found ${csvFiles.length} CSV export files:`);
csvFiles.forEach(f => console.log(`   - ${path.basename(f)}`));

// Simple CSV parser (handles quoted fields)
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

// Parse all CSV files and merge
const allEntities = new Map(); // Use license_id as key to dedupe

csvFiles.forEach(csvFile => {
    console.log(`\n📂 Parsing: ${path.basename(csvFile)}`);
    const content = fs.readFileSync(csvFile, 'utf-8');
    const rows = parseCSV(content);
    console.log(`   Found ${rows.length.toLocaleString()} rows`);

    rows.forEach(row => {
        const licenseId = row['License Number'];
        if (!licenseId) return;

        // Normalize status
        let status = row['License Status'] || 'Unknown';
        let statusDate = '';
        const dateMatch = status.match(/as of\s+(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch) {
            statusDate = dateMatch[1];
            status = status.replace(/\s+as of\s+\d{2}\/\d{2}\/\d{4}/, '').trim();
        }

        // Build address
        const street = [row['AddressLine1'], row['AddressLine2'], row['AddressLine3']]
            .filter(a => a && a.trim())
            .join(', ');

        // Check for ghost office
        const isGhostOffice = !street ||
            street.length < 5 ||
            street.includes('County');

        const entity = {
            license_id: licenseId,
            name: row['Name of Program'] || '',
            owner: row['License Holder'] || '', // THIS IS THE KEY FIELD!
            status: status,
            status_date: statusDate,
            street: street,
            city: row['City'] || '',
            zip: row['Zip'] || '',
            phone: row['Phone'] || '',
            county: row['County'] || '',
            service_type: row['License Type'] || '',
            email: row['EmailAddress'] || '',
            services: row['Services'] || '',
            is_ghost_office: isGhostOffice,
            has_curated_data: false
        };

        // Only add if not already present (or replace if this one has more data)
        if (!allEntities.has(licenseId) || entity.owner) {
            allEntities.set(licenseId, entity);
        }
    });
});

const entities = Array.from(allEntities.values());

console.log(`\n✅ Total unique entities: ${entities.length.toLocaleString()}`);

// Count stats
const withOwner = entities.filter(e => e.owner && e.owner.length > 0).length;
const ghostOffices = entities.filter(e => e.is_ghost_office).length;

const statusCounts = {};
entities.forEach(e => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
});

console.log(`\n📊 Stats:`);
console.log(`   With Owner: ${withOwner.toLocaleString()}`);
console.log(`   Ghost Offices: ${ghostOffices.toLocaleString()}`);
console.log(`\n📊 Status Breakdown:`);
Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
        console.log(`   ${status}: ${count.toLocaleString()}`);
    });

// Output JSON
const output = {
    meta: {
        source: 'MN DHS Licensing Lookup CSV Export',
        generated: new Date().toISOString(),
        total_entities: entities.length,
        with_owner: withOwner,
        ghost_offices_count: ghostOffices,
        status_counts: statusCounts,
        source_files: csvFiles.map(f => path.basename(f))
    },
    entities: entities
};

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));
console.log(`\n💾 Wrote: ${OUTPUT_JSON}`);

// Output CSV
const csvHeaders = ['license_id', 'name', 'owner', 'status', 'status_date', 'street', 'city', 'zip', 'phone', 'county', 'service_type', 'is_ghost_office'];
const csvRows = entities.map(e =>
    csvHeaders.map(h => `"${(e[h]?.toString() || '').replace(/"/g, '""')}"`).join(',')
);
fs.writeFileSync(OUTPUT_CSV, [csvHeaders.join(','), ...csvRows].join('\n'));
console.log(`💾 Wrote: ${OUTPUT_CSV}`);

// Sample with owners
console.log(`\n📋 Sample entities with owners:`);
entities.filter(e => e.owner && e.owner !== e.name).slice(0, 5).forEach(e => {
    console.log(`   ${e.name}`);
    console.log(`      Owner: ${e.owner}`);
    console.log(`      Status: ${e.status}`);
});
