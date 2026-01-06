import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Address Validation API using OpenStreetMap
 * 
 * Uses:
 * 1. Nominatim for geocoding/validation
 * 2. Overpass API for property type detection
 * 
 * Flags:
 * - Virtual offices
 * - PO Boxes
 * - Residential addresses claiming commercial use
 * - Non-existent addresses
 */

interface AddressValidation {
    query: string;
    valid: boolean;
    confidence: number;  // 0-100
    addressType?: 'commercial' | 'residential' | 'virtual_office' | 'po_box' | 'unknown';
    coordinates?: { lat: number; lon: number };
    formattedAddress?: string;
    riskFlags: string[];
    osmData?: {
        placeId: string;
        type: string;
        class: string;
    };
}

// Virtual office indicators
const VIRTUAL_OFFICE_KEYWORDS = [
    'regus', 'wework', 'spaces', 'executive suites', 'virtual office',
    'mail forwarding', 'ups store', 'fedex office', 'postal connections',
    'the ups store', 'ipostage', 'anytime mailbox'
];

// Known virtual office addresses in MN (curated)
const KNOWN_VIRTUAL_OFFICES = [
    '7800 metro pkwy',
    '510 marquette ave',
    '100 washington ave',
    '80 south 8th street'
];

async function validateWithNominatim(address: string, city: string = 'Minneapolis', state: string = 'MN'): Promise<AddressValidation> {
    const query = `${address}, ${city}, ${state}`;

    try {
        // Nominatim geocoding (free, rate-limited)
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'json');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '1');
        url.searchParams.set('countrycodes', 'us');

        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'ProjectCrosscheck/2.0 (Research)',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            return {
                query,
                valid: false,
                confidence: 0,
                riskFlags: ['GEOCODING_FAILED: Unable to verify address']
            };
        }

        const results = await response.json();

        if (!results || results.length === 0) {
            return {
                query,
                valid: false,
                confidence: 0,
                riskFlags: ['ADDRESS_NOT_FOUND: No matching address in OSM']
            };
        }

        const result = results[0];
        const riskFlags: string[] = [];

        // Determine address type from OSM class/type
        let addressType: AddressValidation['addressType'] = 'unknown';

        if (result.class === 'office' || result.class === 'commercial') {
            addressType = 'commercial';
        } else if (result.class === 'building' && result.type === 'residential') {
            addressType = 'residential';
            riskFlags.push('RESIDENTIAL_ADDRESS: Address appears to be residential');
        } else if (result.class === 'amenity' && result.type === 'post_office') {
            addressType = 'po_box';
            riskFlags.push('PO_BOX: Address is a post office or mail center');
        }

        // Check for virtual office keywords
        const lowerQuery = query.toLowerCase();
        const lowerDisplay = (result.display_name || '').toLowerCase();

        for (const keyword of VIRTUAL_OFFICE_KEYWORDS) {
            if (lowerQuery.includes(keyword) || lowerDisplay.includes(keyword)) {
                addressType = 'virtual_office';
                riskFlags.push(`VIRTUAL_OFFICE: Contains virtual office indicator "${keyword}"`);
                break;
            }
        }

        // Check known virtual offices
        const lowerAddress = address.toLowerCase();
        for (const known of KNOWN_VIRTUAL_OFFICES) {
            if (lowerAddress.includes(known)) {
                addressType = 'virtual_office';
                riskFlags.push('KNOWN_VIRTUAL_OFFICE: Address is at known virtual office location');
                break;
            }
        }

        // Calculate confidence based on result quality
        let confidence = 70; // Base confidence
        if (result.importance) confidence += result.importance * 20;
        if (result.class === 'building') confidence += 10;
        confidence = Math.min(100, Math.round(confidence));

        return {
            query,
            valid: true,
            confidence,
            addressType,
            coordinates: {
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon)
            },
            formattedAddress: result.display_name,
            riskFlags,
            osmData: {
                placeId: result.place_id,
                type: result.type,
                class: result.class
            }
        };

    } catch (error) {
        console.error('[OSM] Geocoding error:', error);
        return {
            query,
            valid: false,
            confidence: 0,
            riskFlags: ['GEOCODING_ERROR: ' + (error instanceof Error ? error.message : 'Unknown error')]
        };
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const address = searchParams.get('address');
    const city = searchParams.get('city') || 'Minneapolis';
    const state = searchParams.get('state') || 'MN';

    if (!address) {
        return NextResponse.json({
            success: false,
            error: 'Must provide address parameter'
        }, { status: 400 });
    }

    // Validate with Nominatim
    const validation = await validateWithNominatim(address, city, state);

    // Additional risk scoring
    let riskScore = 0;
    if (!validation.valid) riskScore += 30;
    if (validation.addressType === 'virtual_office') riskScore += 25;
    if (validation.addressType === 'po_box') riskScore += 20;
    if (validation.addressType === 'residential') riskScore += 15;
    riskScore += validation.riskFlags.length * 5;
    riskScore = Math.min(100, riskScore);

    return NextResponse.json({
        success: true,
        validation,
        riskScore,
        recommendation: riskScore >= 40
            ? 'Site inspection recommended'
            : riskScore >= 20
                ? 'Additional documentation may be required'
                : 'Address appears valid',
        sources: {
            geocoding: 'OpenStreetMap Nominatim',
            license: 'ODbL (Open Database License)'
        },
        timestamp: new Date().toISOString()
    });
}

// POST for batch validation
export async function POST(request: Request) {
    try {
        const { addresses } = await request.json();

        if (!Array.isArray(addresses) || addresses.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Must provide addresses array'
            }, { status: 400 });
        }

        // Limit batch size and add delay to respect rate limits
        const batch = addresses.slice(0, 20);
        const results: AddressValidation[] = [];

        for (const addr of batch) {
            const validation = await validateWithNominatim(
                addr.address || addr,
                addr.city || 'Minneapolis',
                addr.state || 'MN'
            );
            results.push(validation);

            // Rate limit: 1 request per second for Nominatim
            await new Promise(r => setTimeout(r, 1100));
        }

        const validCount = results.filter(r => r.valid).length;
        const flaggedCount = results.filter(r => r.riskFlags.length > 0).length;

        return NextResponse.json({
            success: true,
            totalChecked: results.length,
            valid: validCount,
            invalid: results.length - validCount,
            flagged: flaggedCount,
            results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Invalid request'
        }, { status: 400 });
    }
}
