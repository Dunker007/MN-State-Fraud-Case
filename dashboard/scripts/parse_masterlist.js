#!/usr/bin/env node
/**
 * Masterlist Parser
 * Converts MN DHS Licensing Lookup export (Masterlist All.txt) to structured CSV and JSON
 * 
 * Usage: node scripts/parse_masterlist.js
 * 
 * Input:  ../Masterlist All.txt
 * Output: lib/masterlist.json (for dashboard)
 *         lib/masterlist.csv  (for Excel/backup)
 */

const fs = require('fs');
const path = require('path');

// Paths
const INPUT_FILE = path.join(__dirname, '..', '..', 'Masterlist All.txt');
const OUTPUT_JSON = path.join(__dirname, '..', 'lib', 'masterlist.json');
const OUTPUT_CSV = path.join(__dirname, '..', 'lib', 'masterlist.csv');

console.log('🔍 Masterlist Parser Starting...');
console.log(`📂 Input:  ${INPUT_FILE}`);
console.log(`📂 Output: ${OUTPUT_JSON}`);

// Read file
const rawText = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = rawText.split(/\r?\n/);

console.log(`📊 Total lines: ${lines.length.toLocaleString()}`);

// Parse entities
const entities = [];
let i = 0;
let skipCount = 0;

// Skip header until we find "Program name and license status."
while (i < lines.length && !lines[i].includes('Program name and license status')) {
    i++;
}

// Parse each block
while (i < lines.length) {
    const line = lines[i];

    // Look for "Program name and license status." header
    if (line.includes('Program name and license status')) {
        i++; // Move to name/status line

        if (i >= lines.length) break;

        const nameStatusLine = lines[i];
        if (!nameStatusLine || nameStatusLine.trim() === '') {
            i++;
            continue;
        }

        // Parse name and status (tab-separated)
        const nameStatusParts = nameStatusLine.split('\t');
        let rawName = nameStatusParts[0]?.trim() || '';
        let rawStatus = nameStatusParts[1]?.trim() || 'Unknown';

        // Extract owner from parentheses in name: "(Owner Name) Entity Name"
        let owner = '';
        const ownerMatch = rawName.match(/^\(([^)]+)\)\s*(.+)$/);
        if (ownerMatch) {
            owner = ownerMatch[1].trim();
            rawName = ownerMatch[2].trim();
        }

        // Parse status and date
        let status = rawStatus;
        let statusDate = '';
        const statusDateMatch = rawStatus.match(/^(.+?)\s+as of\s+(\d{2}\/\d{2}\/\d{4})$/);
        if (statusDateMatch) {
            status = statusDateMatch[1].trim();
            statusDate = statusDateMatch[2];
        }

        // Normalize status
        if (status.includes('Temp Immediate Suspension')) status = 'Suspended';
        if (status.includes('Revoked')) status = 'Revoked';

        i++; // Move past name line

        // Skip "License address, phone..." header
        if (i < lines.length && lines[i].includes('License address')) {
            i++;
        }

        // Parse address block (flexible - may have 4-5 lines)
        let street = '';
        let city = '';
        let zip = '';
        let phone = '';
        let county = '';
        let licenseId = '';
        let serviceType = '';

        // Line 1: Street address
        if (i < lines.length && lines[i].trim()) {
            street = lines[i].trim();
            i++;
        }

        // Line 2: City, State Zip OR phone
        if (i < lines.length && lines[i].trim()) {
            const cityLine = lines[i].trim();
            // Check if it's a city/state/zip line
            const cityMatch = cityLine.match(/^(.+?),?\s*MN\s*(\d{5})/);
            if (cityMatch) {
                city = cityMatch[1].replace(/,\s*$/, '').trim();
                zip = cityMatch[2];
                i++;
            }
        }

        // Line 3: Phone (optional)
        if (i < lines.length) {
            const phoneLine = lines[i].trim();
            const phoneMatch = phoneLine.match(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
            if (phoneMatch) {
                phone = phoneLine;
                i++;
            }
        }

        // Line 4: County + License number (tab-separated)
        if (i < lines.length && lines[i].includes('License number:') || lines[i].includes('Certificate number:')) {
            const countyLine = lines[i];
            const countyParts = countyLine.split('\t');
            county = countyParts[0]?.replace(' County', '').trim() || '';

            const licenseMatch = countyLine.match(/(?:License|Certificate) number:\s*(\d+)/);
            if (licenseMatch) {
                licenseId = licenseMatch[1];
            }
            i++;
        }

        // Line 5: Type of service
        if (i < lines.length && lines[i].includes('Type of service:')) {
            serviceType = lines[i].replace('Type of service:', '').trim();
            i++;
        }

        // Only add if we have a license ID
        if (licenseId) {
            entities.push({
                license_id: licenseId,
                name: rawName,
                owner: owner,
                status: status,
                status_date: statusDate,
                street: street,
                city: city,
                zip: zip,
                phone: phone,
                county: county,
                service_type: serviceType
            });
        } else {
            skipCount++;
        }

        continue;
    }

    i++;
}

console.log(`✅ Parsed ${entities.length.toLocaleString()} entities`);
console.log(`⚠️  Skipped ${skipCount} entries (missing license ID)`);

// Status breakdown
const statusCounts = {};
entities.forEach(e => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
});
console.log('\n📊 Status Breakdown:');
Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
        console.log(`   ${status}: ${count.toLocaleString()}`);
    });

// Service type breakdown
const serviceTypeCounts = {};
entities.forEach(e => {
    const svc = e.service_type || 'Unknown';
    serviceTypeCounts[svc] = (serviceTypeCounts[svc] || 0) + 1;
});
console.log('\n📊 Service Type Breakdown:');
Object.entries(serviceTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([type, count]) => {
        console.log(`   ${type}: ${count.toLocaleString()}`);
    });

// Write JSON
const jsonOutput = {
    meta: {
        source: 'MN DHS Licensing Information Lookup',
        generated: new Date().toISOString(),
        total_entities: entities.length,
        status_counts: statusCounts
    },
    entities: entities
};
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(jsonOutput, null, 2));
console.log(`\n💾 Wrote JSON: ${OUTPUT_JSON}`);

// Write CSV
const csvHeaders = ['license_id', 'name', 'owner', 'status', 'status_date', 'street', 'city', 'zip', 'phone', 'county', 'service_type'];
const csvRows = entities.map(e =>
    csvHeaders.map(h => `"${(e[h] || '').replace(/"/g, '""')}"`).join(',')
);
const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
fs.writeFileSync(OUTPUT_CSV, csvContent);
console.log(`💾 Wrote CSV: ${OUTPUT_CSV}`);

// Sample output
console.log('\n📋 Sample Entities (first 3):');
entities.slice(0, 3).forEach((e, i) => {
    console.log(`   ${i + 1}. ${e.name} [${e.license_id}] - ${e.status}`);
});

console.log('\n✅ Done!');
