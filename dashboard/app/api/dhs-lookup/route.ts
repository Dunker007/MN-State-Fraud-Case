/**
 * DHS Data Import API
 * Parses CSV exports from MN DHS License Lookup and compares against our database
 * 
 * This approach uses DHS's official "Send Results to CSV File" feature
 * rather than automated scraping - fully compliant with their terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { masterlistData } from '@/lib/data';

interface DHSCSVRecord {
    license_number: string;
    program_name: string;
    license_type: string;
    status: string;
    address: string;
    city: string;
    county: string;
    zip: string;
    phone: string;
    license_holder: string;
    initial_effective_date?: string;
    last_renewed?: string;
}

interface ComparisonResult {
    license_id: string;
    program_name: string;
    our_status: string | null;
    dhs_status: string;
    status_match: boolean;
    in_our_database: boolean;
    discrepancy?: string;
}

/**
 * Parse DHS CSV format
 * Expected columns based on DHS export:
 * License Number,Program Name,License Type,Status,Address,City,County,Zip,Phone,License Holder
 */
function parseCSV(csvContent: string): DHSCSVRecord[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse header to get column indices
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());

    // Map common column names
    const colMap = {
        license_number: headers.findIndex(h => h.includes('license') && h.includes('number')),
        program_name: headers.findIndex(h => h.includes('program') || h.includes('name')),
        license_type: headers.findIndex(h => h.includes('type')),
        status: headers.findIndex(h => h.includes('status')),
        address: headers.findIndex(h => h.includes('address')),
        city: headers.findIndex(h => h.includes('city')),
        county: headers.findIndex(h => h.includes('county')),
        zip: headers.findIndex(h => h.includes('zip')),
        phone: headers.findIndex(h => h.includes('phone')),
        license_holder: headers.findIndex(h => h.includes('holder') || h.includes('licensee')),
    };

    const records: DHSCSVRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 3) continue; // Skip malformed lines

        records.push({
            license_number: getValue(values, colMap.license_number),
            program_name: getValue(values, colMap.program_name),
            license_type: getValue(values, colMap.license_type),
            status: getValue(values, colMap.status),
            address: getValue(values, colMap.address),
            city: getValue(values, colMap.city),
            county: getValue(values, colMap.county),
            zip: getValue(values, colMap.zip),
            phone: getValue(values, colMap.phone),
            license_holder: getValue(values, colMap.license_holder),
        });
    }

    return records;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

function getValue(values: string[], index: number): string {
    if (index < 0 || index >= values.length) return '';
    return values[index]?.trim() || '';
}

/**
 * Compare DHS records against our database
 */
function compareWithDatabase(dhsRecords: DHSCSVRecord[]): ComparisonResult[] {
    const results: ComparisonResult[] = [];

    for (const dhs of dhsRecords) {
        // Try to find matching entity in our database by license number
        const ourEntity = masterlistData.entities.find(e =>
            e.license_id === dhs.license_number ||
            e.license_id === `MN-${dhs.license_number}` ||
            e.name.toLowerCase() === dhs.program_name.toLowerCase()
        );

        const inOurDatabase = !!ourEntity;
        const ourStatus = ourEntity?.status || null;

        // Normalize statuses for comparison
        const normalizedDHSStatus = dhs.status.toUpperCase();
        const normalizedOurStatus = ourStatus?.toUpperCase() || '';

        // Status matching logic
        let statusMatch = false;
        if (ourEntity) {
            // Check if key status words match
            const dhsActive = normalizedDHSStatus.includes('ACTIVE');
            const dhsRevoked = normalizedDHSStatus.includes('REVOKED');
            const dhsInactive = normalizedDHSStatus.includes('INACTIVE') || normalizedDHSStatus.includes('CLOSED');

            const ourActive = normalizedOurStatus.includes('ACTIVE');
            const ourRevoked = normalizedOurStatus.includes('REVOKED');
            const ourInactive = normalizedOurStatus.includes('INACTIVE') || normalizedOurStatus.includes('CLOSED');

            statusMatch = (dhsActive === ourActive) && (dhsRevoked === ourRevoked) && (dhsInactive === ourInactive);
        }

        let discrepancy: string | undefined;
        if (inOurDatabase && !statusMatch) {
            discrepancy = `Status mismatch: DHS shows "${dhs.status}" but we have "${ourEntity?.status}"`;
        }

        results.push({
            license_id: dhs.license_number,
            program_name: dhs.program_name,
            our_status: ourStatus,
            dhs_status: dhs.status,
            status_match: statusMatch,
            in_our_database: inOurDatabase,
            discrepancy
        });
    }

    return results;
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || '';

        let csvContent: string;

        if (contentType.includes('multipart/form-data')) {
            // Handle file upload
            const formData = await request.formData();
            const file = formData.get('file') as File;

            if (!file) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 });
            }

            csvContent = await file.text();
        } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
            // Handle raw CSV text
            csvContent = await request.text();
        } else {
            // Try JSON with csv field
            const json = await request.json();
            csvContent = json.csv || json.data;

            if (!csvContent) {
                return NextResponse.json({
                    error: 'No CSV data provided',
                    usage: {
                        method: 'POST',
                        content_types: ['multipart/form-data', 'text/csv', 'application/json'],
                        file_upload: 'Use form-data with "file" field',
                        raw_csv: 'Send CSV content as text/csv',
                        json: 'Send { "csv": "...csv content..." }'
                    }
                }, { status: 400 });
            }
        }

        // Parse the CSV
        const records = parseCSV(csvContent);

        if (records.length === 0) {
            return NextResponse.json({
                error: 'Could not parse CSV or no valid records found',
                hint: 'Ensure CSV has headers like: License Number, Program Name, Status, etc.'
            }, { status: 400 });
        }

        // Compare with our database
        const comparison = compareWithDatabase(records);

        // Generate summary statistics
        const stats = {
            total_records: records.length,
            in_our_database: comparison.filter(c => c.in_our_database).length,
            not_in_our_database: comparison.filter(c => !c.in_our_database).length,
            status_matches: comparison.filter(c => c.in_our_database && c.status_match).length,
            status_mismatches: comparison.filter(c => c.in_our_database && !c.status_match).length,
        };

        // Highlight critical discrepancies
        const discrepancies = comparison.filter(c => c.discrepancy);
        const newProviders = comparison.filter(c => !c.in_our_database);

        return NextResponse.json({
            success: true,
            stats,
            discrepancies: discrepancies.slice(0, 50), // Limit to first 50
            new_providers: newProviders.slice(0, 50),
            all_results: comparison,
            timestamp: new Date().toISOString(),
            source: 'DHS CSV Import'
        });

    } catch (error) {
        console.error('[DHS_IMPORT] Error:', error);
        return NextResponse.json({
            error: 'Failed to process CSV',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        name: 'DHS CSV Import API',
        description: 'Upload a CSV export from MN DHS License Lookup to compare against our database',
        instructions: [
            '1. Go to https://licensinglookup.dhs.state.mn.us/',
            '2. Search for providers you want to verify',
            '3. Click "Send Results to CSV File" to download the CSV',
            '4. POST the CSV file to this endpoint',
        ],
        endpoints: {
            POST: {
                description: 'Upload CSV for comparison',
                accepts: ['multipart/form-data', 'text/csv', 'application/json'],
            }
        }
    });
}
