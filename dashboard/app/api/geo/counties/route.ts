import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Vercel Pro: Low-latency geo data
export const dynamic = 'force-dynamic';

// Minnesota County FIPS codes with names
const MN_COUNTIES: Record<string, string> = {
    '27001': 'Aitkin',
    '27003': 'Anoka',
    '27005': 'Becker',
    '27007': 'Beltrami',
    '27009': 'Benton',
    '27011': 'Big Stone',
    '27013': 'Blue Earth',
    '27015': 'Brown',
    '27017': 'Carlton',
    '27019': 'Carver',
    '27021': 'Cass',
    '27023': 'Chippewa',
    '27025': 'Chisago',
    '27027': 'Clay',
    '27029': 'Clearwater',
    '27031': 'Cook',
    '27033': 'Cottonwood',
    '27035': 'Crow Wing',
    '27037': 'Dakota',
    '27039': 'Dodge',
    '27041': 'Douglas',
    '27043': 'Faribault',
    '27045': 'Fillmore',
    '27047': 'Freeborn',
    '27049': 'Goodhue',
    '27051': 'Grant',
    '27053': 'Hennepin',
    '27055': 'Houston',
    '27057': 'Hubbard',
    '27059': 'Isanti',
    '27061': 'Itasca',
    '27063': 'Jackson',
    '27065': 'Kanabec',
    '27067': 'Kandiyohi',
    '27069': 'Kittson',
    '27071': 'Koochiching',
    '27073': 'Lac qui Parle',
    '27075': 'Lake',
    '27077': 'Lake of the Woods',
    '27079': 'Le Sueur',
    '27081': 'Lincoln',
    '27083': 'Lyon',
    '27085': 'McLeod',
    '27087': 'Mahnomen',
    '27089': 'Marshall',
    '27091': 'Martin',
    '27093': 'Meeker',
    '27095': 'Mille Lacs',
    '27097': 'Morrison',
    '27099': 'Mower',
    '27101': 'Murray',
    '27103': 'Nicollet',
    '27105': 'Nobles',
    '27107': 'Norman',
    '27109': 'Olmsted',
    '27111': 'Otter Tail',
    '27113': 'Pennington',
    '27115': 'Pine',
    '27117': 'Pipestone',
    '27119': 'Polk',
    '27121': 'Pope',
    '27123': 'Ramsey',
    '27125': 'Red Lake',
    '27127': 'Redwood',
    '27129': 'Renville',
    '27131': 'Rice',
    '27133': 'Rock',
    '27135': 'Roseau',
    '27137': 'St. Louis',
    '27139': 'Scott',
    '27141': 'Sherburne',
    '27143': 'Sibley',
    '27145': 'Stearns',
    '27147': 'Steele',
    '27149': 'Stevens',
    '27151': 'Swift',
    '27153': 'Todd',
    '27155': 'Traverse',
    '27157': 'Wabasha',
    '27159': 'Wadena',
    '27161': 'Waseca',
    '27163': 'Washington',
    '27165': 'Watonwan',
    '27167': 'Wilkin',
    '27169': 'Winona',
    '27171': 'Wright',
    '27173': 'Yellow Medicine',
};

// Population data for weighting (2023 estimates in thousands)
const COUNTY_POPULATIONS: Record<string, number> = {
    '27053': 1281.6, // Hennepin
    '27123': 552.3,  // Ramsey
    '27037': 445.3,  // Dakota
    '27003': 367.9,  // Anoka
    '27163': 270.8,  // Washington
    '27139': 156.5,  // Scott
    '27171': 151.5,  // Wright
    '27145': 163.2,  // Stearns
    '27137': 202.0,  // St. Louis
    '27109': 167.0,  // Olmsted
    '27141': 102.8,  // Sherburne
    '27019': 109.4,  // Carver
    '27035': 68.9,   // Crow Wing
    '27067': 44.8,   // Kandiyohi
    '27131': 68.5,   // Rice
    '27027': 65.2,   // Clay
    '27013': 70.4,   // Blue Earth
    '27025': 60.1,   // Chisago
    '27047': 30.4,   // Freeborn
    '27111': 59.6,   // Otter Tail
};

interface CountyData {
    fips: string;
    name: string;
    claims: number;
    population?: number;
    claimsPerCapita?: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

function generateClaimData(): Record<string, number> {
    // Generate claim data based on population + fraud pattern overlays
    const claimData: Record<string, number> = {};

    // Base claims proportional to population
    for (const [fips, pop] of Object.entries(COUNTY_POPULATIONS)) {
        // Base rate: ~2% of population files claims
        const baseRate = 0.02;
        const baseClaims = Math.round(pop * 1000 * baseRate);

        // Add some randomness (±20%)
        const variance = 0.2;
        const adjustedClaims = Math.round(baseClaims * (1 + (Math.random() - 0.5) * variance));

        claimData[fips] = adjustedClaims;
    }

    // Apply fraud pattern hotspots (55407 is in Hennepin)
    claimData['27053'] = Math.round((claimData['27053'] || 0) * 1.15); // 15% inflation from fraud
    claimData['27123'] = Math.round((claimData['27123'] || 0) * 1.08); // 8% inflation

    // Add smaller counties with minimal claims
    for (const fips of Object.keys(MN_COUNTIES)) {
        if (!claimData[fips]) {
            claimData[fips] = Math.round(Math.random() * 100 + 10);
        }
    }

    return claimData;
}

function getRiskLevel(claims: number, maxClaims: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = claims / maxClaims;
    if (ratio > 0.8) return 'critical';
    if (ratio > 0.5) return 'high';
    if (ratio > 0.2) return 'medium';
    return 'low';
}

export async function GET() {
    const claimData = generateClaimData();
    const maxClaims = Math.max(...Object.values(claimData));

    // Build detailed county data
    const counties: CountyData[] = Object.entries(claimData).map(([fips, claims]) => {
        const population = COUNTY_POPULATIONS[fips];
        return {
            fips,
            name: MN_COUNTIES[fips] || 'Unknown',
            claims,
            population: population ? population * 1000 : undefined,
            claimsPerCapita: population ? (claims / (population * 1000)) : undefined,
            riskLevel: getRiskLevel(claims, maxClaims)
        };
    }).sort((a, b) => b.claims - a.claims);

    // Calculate statistics
    const totalClaims = Object.values(claimData).reduce((a, b) => a + b, 0);
    const countiesWithClaims = Object.keys(claimData).length;
    const criticalCounties = counties.filter(c => c.riskLevel === 'critical').length;
    const highCounties = counties.filter(c => c.riskLevel === 'high').length;

    return NextResponse.json({
        success: true,
        claimData, // FIPS -> count mapping for the map
        counties: counties.slice(0, 20), // Top 20 counties
        stats: {
            totalClaims,
            countiesWithClaims,
            criticalCounties,
            highCounties,
            topCounty: counties[0]?.name || 'N/A',
            topCountyClaims: counties[0]?.claims || 0
        },
        timestamp: new Date().toISOString()
    });
}
