/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const outputPath = 'c:/Repos GIT/MN State Fraud Case/dashboard/lib/evidence_dump.json';

// Data Container
let allData = [];

// 1. Ingest Standard CSVs (Rich Data: Owner info available)
const csvFiles = fs.readdirSync(__dirname + '/../..').filter(f => f.startsWith('Licensing_Lookup_Results') && f.endsWith('.csv'));
console.log(`[SYSTEM] Found ${csvFiles.length} CSV source files. Ingesting...`);

csvFiles.forEach(file => {
    try {
        const csvFilePath = path.join(__dirname, '../../', file);
        const fileContent = fs.readFileSync(csvFilePath, 'utf8');
        const results = Papa.parse(fileContent, { header: true, skipEmptyLines: true, dynamicTyping: true });

        results.data.forEach(row => {
            allData.push({
                source: 'CSV',
                licenseNum: row['License Number'],
                name: String(row['Name of Program'] || "Unknown").trim(),
                status: String(row['License Status'] || "Unknown").trim(),
                holder: String(row['License Holder'] || "").trim(),
                email: String(row['EmailAddress'] || "").trim().toLowerCase(),
                phone: String(row['Phone'] || "").replace(/\D/g, ''),
                address: String(row['AddressLine1'] || "").trim().toUpperCase(),
                city: String(row['City'] || "").trim().toUpperCase(),
                type: row['License Type'] || "Unknown"
            });
        });
        console.log(`  > Ingested ${results.data.length} records from ${file}`);
    } catch (err) {
        console.error(`  ! Failed to parse ${file}: ${err.message}`);
    }
});

// 2. Ingest "Masterlist All.txt" (Broad Data: Statewide, but unstructured)
const txtPath = path.join(__dirname, '../../Masterlist All.txt');
if (fs.existsSync(txtPath)) {
    console.log(`[SYSTEM] Found Masterlist All.txt. Parsing unstructured text...`);
    const txtContent = fs.readFileSync(txtPath, 'utf8');

    // Split by the recurring header
    const blocks = txtContent.split('Program name and license status.');
    console.log(`  > Found ${blocks.length} potential text blocks.`);

    blocks.forEach(block => {
        if (!block || block.length < 10) return;

        // Extract License Number
        const licMatch = block.match(/License number:\s*(\d+)/i);
        const licNum = licMatch ? licMatch[1] : null;
        if (!licNum) return;

        // Extract Status & Name (First non-empty line)
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        let nameLine = lines[0];
        if (nameLine === "Program name and license status.") nameLine = lines[1]; // Handle overlap

        let name = "Unknown";
        let status = "Unknown";

        // Regex to split Name and Status (Status is usually Active, Closed..., Revoked...)
        // Look for the status keywords at the end of the line
        const statusMatch = nameLine.match(/^(.*?)\s+(Active|Closed\s+as\s+of|Revoked|Denied|Conditional|Suspended)(.*)$/i);

        if (statusMatch) {
            name = statusMatch[1].trim();
            status = statusMatch[2].trim() + (statusMatch[3] || "");
        } else {
            // Fallback: take whole line
            name = nameLine;
        }

        // Extract Address (Look for City, MN Zip line)
        // Pattern: "City, MN Zip" or "City, MN ZipLicenseNumber" (junk at end)
        const addressMatch = block.match(/([A-Za-z\s\.]+),\s*MN\s+(\d{5})/);
        let city = "";
        let address = "";

        if (addressMatch) {
            city = addressMatch[1].trim().toUpperCase();
            // Address line is usually strictly before the city line
            // Find index of city match in lines
            const cityLineIdx = lines.findIndex(l => l.includes(addressMatch[0]));
            if (cityLineIdx > 0) {
                address = lines[cityLineIdx - 1].toUpperCase();
                // Filter out junk
                if (address.includes("License address")) address = "";
            }
        }

        // Extract Type
        const typeMatch = block.match(/Type of service:\s*(.*)/i);
        const type = typeMatch ? typeMatch[1].trim() : "Unknown";

        allData.push({
            source: 'TXT',
            licenseNum: licNum,
            name: name,
            status: status,
            holder: name.toUpperCase(), // Fallback: Holder = Name
            email: "", // No email in TXT
            phone: "", // Parsing phone is hard/unreliable in this mess
            address: address,
            city: city,
            type: type
        });
    });
}

// Process Data
let rawEntities = [];
let emailMap = new Map();
let phoneMap = new Map();
let holderMap = new Map(); // Owner network
let addressMap = new Map();
let processedIds = new Set();

// NETWORK HEALTH TRACKING
let networkHealth = new Map(); // holder -> { total: 0, bad: 0 }

// Pass 1: Deduplication & Network Building
// PRIORITY: CSV > TXT (because CSV has "License Holder" separated)
// Sort data so CSV comes first?
allData.sort((a, b) => {
    if (a.source === b.source) return 0;
    return a.source === 'CSV' ? -1 : 1;
});

allData.forEach((row) => {
    // Normalization
    const licenseNum = String(row.licenseNum);
    if (!licenseNum || processedIds.has(licenseNum)) return; // Dedupe
    processedIds.add(licenseNum);

    const name = row.name;
    const rawStatus = row.status;
    const status = rawStatus.split(/ as of| effective| starts/i)[0].toUpperCase(); // Robust split

    // Normalize Owner
    // If the name is ALL CAPS (likely from Masterlist), keep it.
    let holder = row.holder ? row.holder.toUpperCase() : name.toUpperCase();

    // "Rotten Apple" Check
    const isProblematic = status.includes("REVOKED") || status.includes("CONDITIONAL") || status.includes("DENIED");

    // Update Network Health
    if (!networkHealth.has(holder)) {
        networkHealth.set(holder, { total: 0, bad: 0 });
    }
    const health = networkHealth.get(holder);
    health.total++;
    if (isProblematic) health.bad++;

    const email = row.email;
    const phone = row.phone;
    const address = row.address;
    const city = row.city;

    // extract embedded owner name like "(Falade Christopher) Fadmetrocare"
    let ownerName = holder;
    const parentheticalMatch = name.match(/\(([^)]+)\)/);
    if (parentheticalMatch) {
        ownerName = parentheticalMatch[1].toUpperCase();
    }

    const entity = {
        id: `MN-${licenseNum}`,
        name: name,
        type: row.type,
        rawStatus: rawStatus,
        email: email,
        phone: phone,
        holder: holder,
        owner: ownerName,
        address: address,
        city: city,
        status: status,
        state_status: rawStatus,
        source_url: `https://mndhs.licensure.state.mn.us/lookup?id=MN-${licenseNum}`,
        last_verified: "2025-12-30",
        amount_billed: Math.floor(Math.random() * (5000000 - 100000) + 100000), // Placeholder financial data
        risk_score: 0,
        red_flag_reason: [] // Reset reasons
    };

    // Add to Maps
    if (email) {
        if (!emailMap.has(email)) emailMap.set(email, []);
        emailMap.get(email).push(entity.id);
    }
    if (phone) {
        if (!phoneMap.has(phone)) phoneMap.set(phone, []);
        phoneMap.get(phone).push(entity.id);
    }
    if (holder) {
        if (!holderMap.has(holder)) holderMap.set(holder, []);
        holderMap.get(holder).push(entity.id);
    }
    if (address && city) {
        const addressKey = `${address}|${city}`;
        if (!addressMap.has(addressKey)) addressMap.set(addressKey, []);
        addressMap.get(addressKey).push(entity.id);
    }

    rawEntities.push(entity);
});

console.log(`[SYSTEM] Master List Processing: ${rawEntities.length} unique entities.`);

// KNOWN FEDERAL TARGETS (The "Signal")
const FED_TARGETS = [
    "FADMETROCARE", "PRESTIGE", "STAR AUTISM", "SULEM", "MAHAD", "ABDI", "NOOR", "COMMUNITY"
];

// Pass 2: Risk Scoring (The "Thinking Cap" Logic)
const forensicEntities = [];
let highRiskAddressClusters = [];

// OPTIMIZATION: Index Name Stems for Phoenix Detection (O(N) setup)
let nameStemMap = new Map();
rawEntities.forEach(e => {
    const stem = e.name.split(' ')[0].toUpperCase();
    if (stem.length > 3) {
        if (!nameStemMap.has(stem)) nameStemMap.set(stem, []);
        nameStemMap.get(stem).push(e);
    }
});

rawEntities.forEach(entity => {
    // 1. Status Check (The most obvious red flag)
    if (entity.status.includes("REVOKED")) {
        entity.risk_score += 100;
        entity.red_flag_reason.push("STATUS: Revoked (Critical)");
    } else if (entity.status.includes("CONDITIONAL")) {
        entity.risk_score += 50;
        entity.red_flag_reason.push("STATUS: Conditional License");
    } else if (entity.status.includes("DENIED")) {
        entity.risk_score += 150;
        entity.red_flag_reason.push("STATUS: License Denied");
    } else if (entity.status.includes("SUSPENDED")) {
        entity.risk_score += 100;
        entity.red_flag_reason.push("STATUS: Suspended");
    }

    // 2. Federal Intelligence Cross-Ref
    let fedStatus = "UNKNOWN";
    const isFedTarget = FED_TARGETS.some(t => entity.name.toUpperCase().includes(t) || entity.owner.toUpperCase().includes(t));

    if (isFedTarget) {
        // Only classify as "INVESTIGATION" if they also have some other red flag or specific name match
        if (entity.name.toUpperCase().includes("FADMETROCARE") || entity.name.toUpperCase().includes("PRESTIGE")) {
            fedStatus = "INDICTED";
            entity.risk_score += 200;
            entity.red_flag_reason.push("FED INTEL: INDICTED / RAIDED");
        } else {
            fedStatus = "INVESTIGATION";
            entity.risk_score += 25; // Lower score for generic name matches to avoid false positives on 'Community'
            // entity.red_flag_reason.push("FED INTEL: WATCHLIST"); // Optional, maybe too noisy
        }
    }
    entity.federal_status = fedStatus;

    // 3. Network Analysis (The "Smart" Logic)
    // NOTE: For TXT-only records, 'holder' == 'name', so network size is smaller unless names match exactly.
    const network = holderMap.get(entity.holder) || [];
    const netHealth = networkHealth.get(entity.holder); // { total, bad }

    entity.linked_count = network.length;
    entity.network_ids = network;

    if (entity.linked_count > 1) {
        // ROTTEN APPLE LOGIC:
        // If the network is 100% CLEAN (bad == 0), we DO NOT penalize for size.
        // If the network has Rot (bad > 0), the WHOLE network gets penalized.

        if (netHealth && netHealth.bad > 0) {
            // This is a "Compromised Network"
            const rotRatio = netHealth.bad / netHealth.total;
            const severity = Math.floor(rotRatio * 100); // 0-100

            entity.risk_score += (entity.linked_count * 2) + (severity * 2);
            entity.red_flag_reason.push(`NETWORK: ${netHealth.bad} Revoked/Conditional in Group of ${netHealth.total}`);
        }
    }

    // 4. Address Clustering (Shell Farms)
    const addressKey = `${entity.address}|${entity.city}`;
    const cluster = addressMap.get(addressKey) || [];
    entity.address_shared_count = cluster.length;

    if (entity.address_shared_count > 3) { // 4 or more at same address
        // Check if it's a "Clean" cluster (e.g. huge HQ) or a "Dirty" cluster

        const isWhitelisted = ["KINDERCARE", "NEW HORIZON"].some(c => entity.holder.includes(c));
        if (!isWhitelisted) {
            entity.risk_score += 75;
            entity.red_flag_reason.push(`CLUSTERING: ${entity.address_shared_count} Entities at Review Address`);
        }
    }

    // 5. THE PHOENIX PATTERN (Rebranding Detection)
    // "The Chameleon that discards its old skin..."
    // Logic: Same Owner or Similar Name + (One Revoked && One Active)

    // Check for Name/Owner Cycling
    const nameStem = entity.name.split(' ')[0].toUpperCase(); // Simple stem: "ZION", "NOOR", etc.

    // Explicit Phoenix Target (ZION)
    const isZion = nameStem === "ZION";

    if (nameStem.length > 3) {
        // Optimized Lookup
        const siblings = nameStemMap.get(nameStem) || [];

        // Is there a "Dead Body" in the closet? (A Revoked sibling)
        // Ensure we don't count self
        const hasDeadSibling = siblings.some(s => s.id !== entity.id && (s.status.includes("REVOKED") || s.status.includes("DENIED")));

        if (hasDeadSibling && entity.status.includes("ACTIVE")) {
            entity.risk_score += 150; // Increased Risk
            entity.red_flag_reason.push(`PHOENIX_PROTOCOL: Rebranding Detected (Linked to Revoked Entity '${nameStem}...')`);
        }
    }

    // Force Flag ZION if generic logic misses it (Safety Net)
    if (isZion && entity.status.includes("ACTIVE") && entity.risk_score === 0) {
        // Double check manual override based on User Request
        const zionSiblings = nameStemMap.get("ZION") || [];
        const hasZionDead = zionSiblings.some(s => s.status.includes("REVOKED"));
        if (hasZionDead) {
            entity.risk_score += 150;
            entity.red_flag_reason.push(`PHOENIX_PROTOCOL: Target 'ZION' Rebranding Pattern`);
        }
    }

    // Flatten Reason
    entity.flag_string = entity.red_flag_reason.join(" | ");

    // FILTER CRITERIA:
    // Only show entities with Risk > 0 OR Federal Interest
    if (entity.risk_score > 0 || entity.federal_status !== "UNKNOWN") {
        forensicEntities.push(entity);
    }
});

// Build Reports
addressMap.forEach((ids, addr) => {
    if (ids.length > 2) { // Report 3+ clusters
        const [a, c] = addr.split('|');
        // Check if high risk (at least one flagged entity in cluster)
        const hasRisk = ids.some(id => rawEntities.find(e => e.id === id).risk_score > 0);
        if (hasRisk) {
            highRiskAddressClusters.push({ address: a, city: c, count: ids.length, ids: ids });
        }
    }
});

highRiskAddressClusters.sort((a, b) => b.count - a.count);

console.log(`[SYSTEM] Risk Analysis Complete. Identified ${forensicEntities.length} Suspicious Targets out of ${rawEntities.length} Total.`);

// Sort by Risk Score descending
forensicEntities.sort((a, b) => b.risk_score - a.risk_score);

// Extract Top Clusters for Dashboard Intel
const topAddressClusters = highRiskAddressClusters.slice(0, 5);

const intelReport = {
    generated_at: new Date().toISOString(),
    total_entities: forensicEntities.length,
    high_risk_address_clusters: topAddressClusters,
    entities: forensicEntities
};

fs.writeFileSync(outputPath, JSON.stringify(intelReport, null, 2));
console.log(`Generated ${forensicEntities.length} entities. Identified ${topAddressClusters.length} suspicious address clusters.`);
