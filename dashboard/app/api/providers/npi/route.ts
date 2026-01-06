import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * NPI Registry API Integration
 * Validates medical providers against the CMS NPPES database
 * Source: https://npiregistry.cms.hhs.gov/api/
 * 
 * FREE API - No key required
 */

interface NPIResult {
    npi: string;
    name: string;
    credential?: string;
    specialty?: string;
    address?: {
        city: string;
        state: string;
        zip: string;
    };
    phone?: string;
    status: 'active' | 'inactive' | 'not_found';
    enumerationDate?: string;
    lastUpdated?: string;
}

interface NPISearchParams {
    npi?: string;
    firstName?: string;
    lastName?: string;
    state?: string;
    city?: string;
    limit?: number;
}

const NPI_API_BASE = 'https://npiregistry.cms.hhs.gov/api/';

async function searchNPIRegistry(params: NPISearchParams): Promise<NPIResult[]> {
    const queryParams = new URLSearchParams({
        version: '2.1',
        enumeration_type: 'NPI-1', // Individual providers
        ...(params.npi && { number: params.npi }),
        ...(params.firstName && { first_name: params.firstName }),
        ...(params.lastName && { last_name: params.lastName }),
        ...(params.state && { state: params.state }),
        ...(params.city && { city: params.city }),
        limit: String(params.limit || 10)
    });

    try {
        const response = await fetch(`${NPI_API_BASE}?${queryParams.toString()}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'ProjectCrosscheck/2.0 (Research)'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            console.error('[NPI] API error:', response.status);
            return [];
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return [];
        }

        return data.results.map((r: Record<string, unknown>) => {
            const basic = r.basic as Record<string, string> | undefined;
            const addresses = r.addresses as Array<Record<string, string>> | undefined;
            const practiceAddr = addresses?.find(a => a.address_purpose === 'LOCATION') || addresses?.[0];
            const taxonomies = r.taxonomies as Array<Record<string, string>> | undefined;
            const primaryTaxonomy = taxonomies?.find(t => t.primary === 'Y') || taxonomies?.[0];

            return {
                npi: r.number as string,
                name: basic
                    ? `${basic.first_name || ''} ${basic.last_name || ''}`.trim()
                    : 'Unknown',
                credential: basic?.credential,
                specialty: primaryTaxonomy?.desc,
                address: practiceAddr ? {
                    city: practiceAddr.city,
                    state: practiceAddr.state,
                    zip: practiceAddr.postal_code?.substring(0, 5)
                } : undefined,
                phone: practiceAddr?.telephone_number,
                status: basic?.status === 'A' ? 'active' : 'inactive',
                enumerationDate: basic?.enumeration_date,
                lastUpdated: basic?.last_updated
            } as NPIResult;
        });
    } catch (error) {
        console.error('[NPI] Fetch error:', error);
        return [];
    }
}

// Cross-reference providers with local database
async function crossReferenceProviders(npiResults: NPIResult[]): Promise<{
    provider: NPIResult;
    localMatch: boolean;
    riskFlags: string[];
}[]> {
    // In production, this would query the provider_db.json
    // For now, simulate cross-reference

    return npiResults.map(provider => {
        const riskFlags: string[] = [];

        // Flag if enumeration is recent (within 90 days)
        if (provider.enumerationDate) {
            const enumDate = new Date(provider.enumerationDate);
            const daysSinceEnum = (Date.now() - enumDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceEnum < 90) {
                riskFlags.push('NEW_PROVIDER: Enumerated within 90 days');
            }
        }

        // Flag if no specialty listed
        if (!provider.specialty) {
            riskFlags.push('NO_SPECIALTY: Missing taxonomy/specialty');
        }

        // Flag if status not active
        if (provider.status === 'inactive') {
            riskFlags.push('INACTIVE: Provider status not active');
        }

        return {
            provider,
            localMatch: false, // Would be true if found in local DB
            riskFlags
        };
    });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const npi = searchParams.get('npi');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const state = searchParams.get('state') || 'MN'; // Default to Minnesota
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!npi && !lastName) {
        return NextResponse.json({
            success: false,
            error: 'Must provide either NPI number or lastName for search'
        }, { status: 400 });
    }

    // Search NPI Registry
    const results = await searchNPIRegistry({
        npi: npi || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        state,
        city: city || undefined,
        limit
    });

    // Cross-reference with local data
    const crossReferenced = await crossReferenceProviders(results);

    // Calculate summary stats
    const activeCount = results.filter(r => r.status === 'active').length;
    const flaggedCount = crossReferenced.filter(r => r.riskFlags.length > 0).length;

    return NextResponse.json({
        success: true,
        query: { npi, firstName, lastName, state, city },
        count: results.length,
        results: crossReferenced,
        stats: {
            active: activeCount,
            inactive: results.length - activeCount,
            flagged: flaggedCount,
            clean: results.length - flaggedCount
        },
        source: 'CMS NPPES Registry',
        timestamp: new Date().toISOString()
    });
}

// POST for batch NPI validation
export async function POST(request: Request) {
    try {
        const { npis } = await request.json();

        if (!Array.isArray(npis) || npis.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Must provide array of NPI numbers'
            }, { status: 400 });
        }

        // Limit batch size
        const batch = npis.slice(0, 50);
        const results: { npi: string; found: boolean; data?: NPIResult }[] = [];

        // Process in chunks of 10 to avoid rate limiting
        for (let i = 0; i < batch.length; i += 10) {
            const chunk = batch.slice(i, i + 10);
            const chunkResults = await Promise.all(
                chunk.map(async (npi: string) => {
                    const found = await searchNPIRegistry({ npi });
                    return {
                        npi,
                        found: found.length > 0,
                        data: found[0]
                    };
                })
            );
            results.push(...chunkResults);

            // Small delay between chunks
            if (i + 10 < batch.length) {
                await new Promise(r => setTimeout(r, 100));
            }
        }

        const foundCount = results.filter(r => r.found).length;
        const ghostProviders = results.filter(r => !r.found);

        return NextResponse.json({
            success: true,
            totalChecked: results.length,
            found: foundCount,
            notFound: results.length - foundCount,
            ghostProviders: ghostProviders.map(g => g.npi),
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
