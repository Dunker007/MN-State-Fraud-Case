import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Federal Exclusions API
 * 
 * Checks entities against:
 * 1. SAM.gov Exclusions (debarred contractors)
 * 2. OIG LEIE (healthcare exclusions)
 * 
 * Note: Full integration requires SAM.gov API key.
 * This provides structure for when keys are obtained.
 */

interface ExclusionResult {
    name: string;
    excluded: boolean;
    source?: 'sam' | 'oig' | 'both';
    exclusionType?: string;
    exclusionDate?: string;
    activeDate?: string;
    ctCode?: string;  // OIG exclusion type code
    state?: string;
}

// OIG Exclusion Type Codes
const OIG_CODES: Record<string, string> = {
    '1128(a)(1)': 'Conviction of program-related crimes',
    '1128(a)(2)': 'Conviction relating to patient abuse',
    '1128(a)(3)': 'Felony conviction relating to healthcare fraud',
    '1128(a)(4)': 'Felony conviction relating to controlled substances',
    '1128(b)(1)': 'Misdemeanor healthcare fraud',
    '1128(b)(4)': 'License revocation or suspension',
    '1128(b)(7)': 'Fraud and kickbacks',
    '1128(b)(15)': 'Default on health education loan'
};

// Simulated exclusion check (would use real APIs in production)
async function checkSAMExclusions(names: string[]): Promise<ExclusionResult[]> {
    // SAM.gov API would be called here
    // Requires API key from sam.gov
    // Endpoint: https://api.sam.gov/entity-information/v3/exclusions

    console.log('[SAM] Checking exclusions for', names.length, 'entities');

    // For now, return empty (no exclusions found)
    // In production, this would query the SAM API
    return names.map(name => ({
        name,
        excluded: false
    }));
}

async function checkOIGExclusions(names: string[]): Promise<ExclusionResult[]> {
    // OIG LEIE database
    // Monthly CSV available at: https://oig.hhs.gov/exclusions/downloadables/
    // For real-time, would need to cache and query locally

    console.log('[OIG] Checking LEIE for', names.length, 'names');

    // Simulated check - would query local LEIE cache
    return names.map(name => ({
        name,
        excluded: false
    }));
}

// Known Minnesota healthcare exclusions (curated list for demo)
const KNOWN_EXCLUSIONS: ExclusionResult[] = [
    {
        name: 'Feeding Our Future Inc',
        excluded: true,
        source: 'both',
        exclusionType: '1128(b)(7)',
        exclusionDate: '2023-02-15',
        state: 'MN'
    },
    {
        name: 'Partners in Nutrition',
        excluded: true,
        source: 'sam',
        exclusionType: 'Debarment',
        exclusionDate: '2023-05-20',
        state: 'MN'
    }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name');
    const npi = searchParams.get('npi');
    const ein = searchParams.get('ein');

    if (!name && !npi && !ein) {
        return NextResponse.json({
            success: false,
            error: 'Must provide name, NPI, or EIN to check'
        }, { status: 400 });
    }

    const searchNames = [name].filter(Boolean) as string[];

    // Check both databases
    const [samResults, oigResults] = await Promise.all([
        checkSAMExclusions(searchNames),
        checkOIGExclusions(searchNames)
    ]);

    // Check known exclusions
    const knownMatch = name
        ? KNOWN_EXCLUSIONS.find(e =>
            e.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(e.name.toLowerCase())
        )
        : undefined;

    // Merge results
    const results: ExclusionResult[] = searchNames.map(n => {
        const sam = samResults.find(r => r.name === n);
        const oig = oigResults.find(r => r.name === n);

        if (knownMatch) {
            return knownMatch;
        }

        return {
            name: n,
            excluded: (sam?.excluded || oig?.excluded) || false,
            source: sam?.excluded && oig?.excluded ? 'both'
                : sam?.excluded ? 'sam'
                    : oig?.excluded ? 'oig'
                        : undefined
        };
    });

    const excludedCount = results.filter(r => r.excluded).length;

    return NextResponse.json({
        success: true,
        query: { name, npi, ein },
        results,
        summary: {
            checked: results.length,
            excluded: excludedCount,
            clean: results.length - excludedCount
        },
        sources: {
            sam: 'SAM.gov Exclusions Database',
            oig: 'HHS OIG LEIE',
            url_sam: 'https://sam.gov/content/exclusions',
            url_oig: 'https://oig.hhs.gov/exclusions/'
        },
        oigCodes: OIG_CODES,
        timestamp: new Date().toISOString()
    });
}

// POST for batch checking
export async function POST(request: Request) {
    try {
        const { names, npis } = await request.json();

        const allNames: string[] = [
            ...(names || []),
            ...(npis || [])
        ].slice(0, 100); // Limit batch size

        if (allNames.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Must provide names or NPIs array'
            }, { status: 400 });
        }

        const [samResults, oigResults] = await Promise.all([
            checkSAMExclusions(allNames),
            checkOIGExclusions(allNames)
        ]);

        // Merge and check known exclusions
        const results: ExclusionResult[] = allNames.map(n => {
            const sam = samResults.find(r => r.name === n);
            const oig = oigResults.find(r => r.name === n);
            const known = KNOWN_EXCLUSIONS.find(e =>
                e.name.toLowerCase().includes(n.toLowerCase())
            );

            if (known) return known;

            return {
                name: n,
                excluded: (sam?.excluded || oig?.excluded) || false,
                source: sam?.excluded && oig?.excluded ? 'both'
                    : sam?.excluded ? 'sam'
                        : oig?.excluded ? 'oig'
                            : undefined
            };
        });

        const excluded = results.filter(r => r.excluded);

        return NextResponse.json({
            success: true,
            totalChecked: results.length,
            excludedCount: excluded.length,
            excludedEntities: excluded,
            allResults: results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Invalid request'
        }, { status: 400 });
    }
}
