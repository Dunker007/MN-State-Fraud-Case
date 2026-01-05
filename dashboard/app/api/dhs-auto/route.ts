/**
 * DHS Auto-Collect API
 * Automates CSV download from MN DHS License Lookup
 * 
 * Mechanism:
 * 1. GET the search results page to capture __VIEWSTATE and __EVENTVALIDATION
 * 2. POST back with __EVENTTARGET=csvdownload to trigger CSV download
 * 3. Return parsed CSV data
 * 
 * Note: This uses the official "Send Results to CSV File" feature
 * Rate limited to prevent abuse.
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://licensinglookup.dhs.state.mn.us';

interface DHSLicense {
    license_number: string;
    program_name: string;
    license_type: string;
    status: string;
    address: string;
    city: string;
    county: string;
    zip: string;
    phone: string;
    license_holder?: string;
}

// Simple rate limiting - track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 5000; // 5 seconds between requests

/**
 * Extract ASP.NET hidden form values from HTML
 */
function extractFormValues(html: string): Record<string, string> {
    const values: Record<string, string> = {};

    const patterns: Array<[string, RegExp]> = [
        ['__VIEWSTATE', /id="__VIEWSTATE"\s+value="([^"]+)"/],
        ['__VIEWSTATEGENERATOR', /id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/],
        ['__EVENTVALIDATION', /id="__EVENTVALIDATION"\s+value="([^"]+)"/],
    ];

    for (const [name, regex] of patterns) {
        const match = html.match(regex);
        if (match) {
            values[name] = match[1];
        }
    }

    return values;
}

/**
 * Parse CSV content into license records
 */
function parseCSV(csvContent: string): DHSLicense[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

    const colMap = {
        license_number: headers.findIndex(h => h.includes('license') && h.includes('number')),
        program_name: headers.findIndex(h => h.includes('program') || (h.includes('name') && !h.includes('license'))),
        license_type: headers.findIndex(h => h.includes('type')),
        status: headers.findIndex(h => h.includes('status')),
        address: headers.findIndex(h => h.includes('address') && !h.includes('city')),
        city: headers.findIndex(h => h.includes('city')),
        county: headers.findIndex(h => h.includes('county')),
        zip: headers.findIndex(h => h.includes('zip')),
        phone: headers.findIndex(h => h.includes('phone')),
        license_holder: headers.findIndex(h => h.includes('holder')),
    };

    const records: DHSLicense[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 3) continue;

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

const COUNTY_MAP: Record<string, string> = {
    "Aitkin": "1", "Anoka": "2", "Becker": "3", "Beltrami": "4", "Benton": "5", "Big Stone": "6",
    "Blue Earth": "7", "Brown": "8", "Carlton": "9", "Carver": "10", "Cass": "11", "Chippewa": "12",
    "Chisago": "13", "Clay": "14", "Clearwater": "15", "Cook": "16", "Cottonwood": "17", "Crow Wing": "18",
    "Dakota": "19", "Dodge": "20", "Douglas": "21", "Faribault": "22", "Faribault & Martin": "92",
    "Fillmore": "23", "Freeborn": "24", "Goodhue": "25", "Grant": "26", "Hennepin": "27", "Houston": "28",
    "Hubbard": "29", "Isanti": "30", "Itasca": "31", "Jackson": "32", "Kanabec": "33", "Kandiyohi": "34",
    "Kittson": "35", "Koochiching": "36", "Lac Qui Parle": "37", "Lake": "38", "Lake of the Woods": "39",
    "Le Sueur": "40", "Lincoln": "41", "Lincoln & Lyon & Murray": "88", "Lyon": "42", "Mahnomen": "44",
    "Marshall": "45", "Martin": "46", "McLeod": "43", "Meeker": "47", "Mille Lacs": "48", "MNPrairie": "93",
    "Morrison": "49", "Mower": "50", "Murray": "51", "Nicollet": "52", "Nobles": "53", "Norman": "54",
    "Olmsted": "55", "Otter Tail": "56", "Pennington": "57", "Pine": "58", "Pipestone": "59", "Polk": "60",
    "Pope": "61", "Ramsey": "62", "Red Lake": "63", "Redwood": "64", "Renville": "65", "Rice": "66",
    "Rock": "67", "Roseau": "68", "Scott": "70", "Sherburne": "71", "Sibley": "72", "St. Louis": "69",
    "Stearns": "73", "Steele": "74", "Stevens": "75", "Swift": "76", "Todd": "77", "Traverse": "78",
    "Wabasha": "79", "Wadena": "80", "Waseca": "81", "Washington": "82", "Watonwan": "83", "Wilkin": "84",
    "Winona": "85", "Wright": "86", "Yellow Medicine": "87"
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('name') || '';
    const county = searchParams.get('county') || '';
    const format = searchParams.get('format') || 'json';

    // Rate limiting check
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL_MS) {
        const waitTime = Math.ceil((MIN_REQUEST_INTERVAL_MS - (now - lastRequestTime)) / 1000);
        return NextResponse.json({
            error: 'Rate limited',
            message: `Please wait ${waitTime} seconds before making another request`,
            retry_after: waitTime
        }, { status: 429 });
    }

    if (!query && !county) {
        return NextResponse.json({
            error: 'Missing query parameters',
            usage: '/api/dhs-auto?q={name}&county={county}',
            example: '/api/dhs-auto?county=Hennepin',
            optional_params: {
                format: 'json (default) or csv'
            }
        }, { status: 400 });
    }

    try {
        lastRequestTime = Date.now();

        // Step 1: GET the search results page
        // Build URL based on correct DHS parameters
        let searchUrl = '';
        const countyId = COUNTY_MAP[county] || '';

        // Full set of parameters seen in real browser requests
        const baseParams = [
            'a=False', 'cdtrt=False', 'crfcc=False', 'crfmhc=False', 'e=0', 'dsfpv=False',
            'hcbsbss=False', 'crfss=False', 'sils62=False', 'irts=False', 'qrtp61=False',
            'crfsc=False', 'afcfads=False', 'ppy40=False', 'rsfsls=False', 'crsrc=False',
            'ppy62=False', 'ppy61=False', 'dsfeds=False', 'sn=All', 'irtsrcs=False',
            'cdtcwct=False', 'hcbsihss=False', 'crssls=False', 'hcbsics=False', 'locked=False',
            'adcrem29=False', 'sils40=False', 'ci=All', 'hcbsds=False', 'crfgrs=False',
            'crfts=False', 'rsfrs=false', 'hcbsrss=False', 'cdtsamht=False', 'hcbsses=False',
            'hcbsiss=False', 'crfrt=False', 'crscr=False', 'crfprtf=False', 'cdtidat=False',
            'stcse40=False', 'qrtp40=False', 'crsaost=False', 'cdtat=False', 'rcs40=False',
            'dsfess=False', 'crfcdc=False', 'rcs=False', 'stcse62=False', 'stcse61=False',
            'qrtp62=False', 'crfmhlock=False', 'dsfees=False', 'tn=All', 'z=', 'mhc=False',
            'crfd=False', 'cdtnrt=False', 'sils61=False', 's=All', 'afcaost=False', 't=All',
            'dsfdth=False'
        ].join('&');

        if (county) {
            searchUrl = `${BASE_URL}/Results.aspx?${baseParams}&con=${encodeURIComponent(county)}&co=${countyId}&n=${encodeURIComponent(query)}&l=`;
        } else {
            searchUrl = `${BASE_URL}/Results.aspx?${baseParams}&n=${encodeURIComponent(query)}&l=`;
        }

        console.log(`[DHS_AUTO] Fetching: ${searchUrl}`);

        const searchResponse = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'max-age=0',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
        });

        if (!searchResponse.ok) {
            return NextResponse.json({
                error: 'Failed to access DHS search',
                status: searchResponse.status,
                statusText: searchResponse.statusText
            }, { status: 502 });
        }

        const searchHtml = await searchResponse.text();

        // Check if we got a captcha/bot block
        if (searchHtml.includes('We apologize for the inconvenience') || searchHtml.includes('CAPTCHA')) {
            return NextResponse.json({
                error: 'DHS site is blocking automated access',
                message: 'The DHS website detected automated access. Please use manual CSV export.',
                manual_url: searchUrl,
                instructions: [
                    '1. Open the above URL in your browser',
                    '2. Complete any CAPTCHA if required',
                    '3. Click "Send Results to CSV File"',
                    '4. Upload the CSV to /api/dhs-lookup'
                ]
            }, { status: 403 });
        }

        // Extract form values
        const formValues = extractFormValues(searchHtml);

        if (!formValues.__VIEWSTATE) {
            return NextResponse.json({
                error: 'Could not extract form state',
                message: 'DHS page structure may have changed',
                manual_url: searchUrl
            }, { status: 500 });
        }

        // Get cookies from the response
        const cookies = searchResponse.headers.get('set-cookie') || '';

        console.log('[DHS_AUTO] Step 2: Triggering CSV download...');

        // Step 2: POST back with csvdownload trigger
        const formData = new URLSearchParams();
        formData.append('__EVENTTARGET', 'csvdownload');
        formData.append('__EVENTARGUMENT', '');
        formData.append('__VIEWSTATE', formValues.__VIEWSTATE);
        if (formValues.__VIEWSTATEGENERATOR) {
            formData.append('__VIEWSTATEGENERATOR', formValues.__VIEWSTATEGENERATOR);
        }
        if (formValues.__EVENTVALIDATION) {
            formData.append('__EVENTVALIDATION', formValues.__EVENTVALIDATION);
        }

        const csvResponse = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/csv,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies,
                'Referer': searchUrl,
            },
            body: formData.toString(),
        });

        if (!csvResponse.ok) {
            return NextResponse.json({
                error: 'CSV download failed',
                status: csvResponse.status
            }, { status: 502 });
        }

        const csvContent = await csvResponse.text();

        // Check if we actually got CSV (should start with headers)
        const isCSV = csvContent.includes('License Number') ||
            csvContent.includes('Program Name') ||
            csvContent.includes(',Active,') ||
            csvContent.includes(',Inactive,');

        if (!isCSV) {
            // We might have gotten HTML back instead
            if (csvContent.includes('<!DOCTYPE') || csvContent.includes('<html')) {
                return NextResponse.json({
                    error: 'Received HTML instead of CSV',
                    message: 'DHS may require session refresh. Try manual export.',
                    manual_url: searchUrl
                }, { status: 500 });
            }
        }

        // If requested in CSV format, return raw
        if (format === 'csv') {
            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="dhs_${query.replace(/\s+/g, '_')}_${Date.now()}.csv"`,
                }
            });
        }

        // Parse and return as JSON
        const records = parseCSV(csvContent);

        // Generate statistics
        const statusCounts: Record<string, number> = {};
        for (const r of records) {
            statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
        }

        return NextResponse.json({
            success: true,
            query,
            total_records: records.length,
            status_breakdown: statusCounts,
            records,
            source: 'MN DHS License Lookup (Auto-Collect)',
            timestamp: new Date().toISOString(),
            dhs_url: searchUrl
        });

    } catch (error) {
        console.error('[DHS_AUTO] Error:', error);
        return NextResponse.json({
            error: 'Auto-collect failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            fallback: 'Use manual CSV export at https://licensinglookup.dhs.state.mn.us/'
        }, { status: 500 });
    }
}
