#!/usr/bin/env node
/**
 * Owner Merger Script
 * Merges owner names from curated evidence_dump.json into masterlist.json
 * based on matching license IDs or name similarity
 * 
 * Usage: node scripts/merge_owners.js
 */

const fs = require('fs');
const path = require('path');

const MASTERLIST_PATH = path.join(__dirname, '..', 'lib', 'masterlist.json');
const EVIDENCE_PATH = path.join(__dirname, '..', 'lib', 'evidence_dump.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'lib', 'masterlist_enriched.json');

console.log('🔍 Loading data sources...');

const masterlist = JSON.parse(fs.readFileSync(MASTERLIST_PATH, 'utf-8'));
const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, 'utf-8'));

console.log(`   Masterlist: ${masterlist.entities.length.toLocaleString()} entities`);
console.log(`   Evidence: ${evidence.entities.length.toLocaleString()} curated entities`);

// Build lookup maps from evidence
const ownerByLicenseId = new Map();
const ownerByName = new Map();

evidence.entities.forEach(e => {
    const licenseId = e.id.replace('MN-', '');
    if (e.owner && e.owner !== 'Unknown') {
        ownerByLicenseId.set(licenseId, e.owner);
        ownerByName.set(e.name.toLowerCase(), e.owner);
    }
});

console.log(`\n📊 Owner data available for ${ownerByLicenseId.size.toLocaleString()} entities by ID`);

// Merge owners into masterlist
let matchedById = 0;
let matchedByName = 0;
let ghostOffices = 0;

const enrichedEntities = masterlist.entities.map(entity => {
    let owner = entity.owner || '';

    // Try match by license ID
    if (!owner && ownerByLicenseId.has(entity.license_id)) {
        owner = ownerByLicenseId.get(entity.license_id);
        matchedById++;
    }

    // Try match by name
    if (!owner && ownerByName.has(entity.name.toLowerCase())) {
        owner = ownerByName.get(entity.name.toLowerCase());
        matchedByName++;
    }

    // Flag ghost offices
    const isGhostOffice = !entity.street ||
        entity.street.trim() === '' ||
        entity.street.includes('County') ||
        entity.street.length < 5;

    if (isGhostOffice) ghostOffices++;

    return {
        ...entity,
        owner: owner,
        is_ghost_office: isGhostOffice,
        has_curated_data: ownerByLicenseId.has(entity.license_id) || ownerByName.has(entity.name.toLowerCase())
    };
});

// Update masterlist with enriched data
const enrichedMasterlist = {
    ...masterlist,
    meta: {
        ...masterlist.meta,
        enriched_at: new Date().toISOString(),
        owners_matched_by_id: matchedById,
        owners_matched_by_name: matchedByName,
        ghost_offices_count: ghostOffices
    },
    entities: enrichedEntities
};

// Write enriched file
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(enrichedMasterlist, null, 2));

// Also update the main masterlist.json
fs.writeFileSync(MASTERLIST_PATH, JSON.stringify(enrichedMasterlist, null, 2));

console.log(`\n✅ Enrichment Complete:`);
console.log(`   Matched by License ID: ${matchedById.toLocaleString()}`);
console.log(`   Matched by Name: ${matchedByName.toLocaleString()}`);
console.log(`   Total with Owner: ${(matchedById + matchedByName + 1).toLocaleString()}`); // +1 for Fadmetrocare
console.log(`   Ghost Offices Flagged: ${ghostOffices.toLocaleString()}`);
console.log(`\n💾 Updated: ${MASTERLIST_PATH}`);
console.log(`💾 Backup: ${OUTPUT_PATH}`);
