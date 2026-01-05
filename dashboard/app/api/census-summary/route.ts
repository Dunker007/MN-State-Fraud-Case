import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// MN County FIPS codes mapped to county names
const COUNTY_FIPS: Record<string, string> = {
    '27001': 'Aitkin', '27003': 'Anoka', '27005': 'Becker', '27007': 'Beltrami',
    '27009': 'Benton', '27011': 'Big Stone', '27013': 'Blue Earth', '27015': 'Brown',
    '27017': 'Carlton', '27019': 'Carver', '27021': 'Cass', '27023': 'Chippewa',
    '27025': 'Chisago', '27027': 'Clay', '27029': 'Clearwater', '27031': 'Cook',
    '27033': 'Cottonwood', '27035': 'Crow Wing', '27037': 'Dakota', '27039': 'Dodge',
    '27041': 'Douglas', '27043': 'Faribault', '27045': 'Fillmore', '27047': 'Freeborn',
    '27049': 'Goodhue', '27051': 'Grant', '27053': 'Hennepin', '27055': 'Houston',
    '27057': 'Hubbard', '27059': 'Isanti', '27061': 'Itasca', '27063': 'Jackson',
    '27065': 'Kanabec', '27067': 'Kandiyohi', '27069': 'Kittson', '27071': 'Koochiching',
    '27073': 'Lac qui Parle', '27075': 'Lake', '27077': 'Lake of the Woods',
    '27079': 'Le Sueur', '27081': 'Lincoln', '27083': 'Lyon', '27085': 'McLeod',
    '27087': 'Mahnomen', '27089': 'Marshall', '27091': 'Martin', '27093': 'Meeker',
    '27095': 'Mille Lacs', '27097': 'Morrison', '27099': 'Mower', '27101': 'Murray',
    '27103': 'Nicollet', '27105': 'Nobles', '27107': 'Norman', '27109': 'Olmsted',
    '27111': 'Otter Tail', '27113': 'Pennington', '27115': 'Pine', '27117': 'Pipestone',
    '27119': 'Polk', '27121': 'Pope', '27123': 'Ramsey', '27125': 'Red Lake',
    '27127': 'Redwood', '27129': 'Renville', '27131': 'Rice', '27133': 'Rock',
    '27135': 'Roseau', '27137': 'St. Louis', '27139': 'Scott', '27141': 'Sherburne',
    '27143': 'Sibley', '27145': 'Stearns', '27147': 'Steele', '27149': 'Stevens',
    '27151': 'Swift', '27153': 'Todd', '27155': 'Traverse', '27157': 'Wabasha',
    '27159': 'Wadena', '27161': 'Waseca', '27163': 'Washington', '27165': 'Watonwan',
    '27167': 'Wilkin', '27169': 'Winona', '27171': 'Wright', '27173': 'Yellow Medicine'
};

export async function GET() {
    try {
        const censusDir = path.join(process.cwd(), 'data', 'master-census');
        const files = await fs.readdir(censusDir);

        const countyCounts: Record<string, { count: number; fips: string }> = {};

        // Process each county CSV
        for (const file of files) {
            if (!file.endsWith('_providers.csv')) continue;

            const countyName = file.replace('_providers.csv', '').replace(/_/g, ' ');
            const filePath = path.join(censusDir, file);

            try {
                const content = await fs.readFile(filePath, 'utf8');
                const lines = content.trim().split('\n');
                const recordCount = Math.max(0, lines.length - 1); // Subtract header

                // Normalize county name for matching (remove periods, normalize whitespace)
                const normalizedName = countyName.replace(/\./g, '').toLowerCase().trim();

                // Find FIPS code for this county
                const fips = Object.entries(COUNTY_FIPS).find(
                    ([_, name]) => name.replace(/\./g, '').toLowerCase().trim() === normalizedName
                )?.[0] || '';

                countyCounts[countyName] = { count: recordCount, fips };
            } catch {
                // Skip files that can't be read
            }
        }

        // Also create FIPS-keyed version for map
        const fipsCounts: Record<string, number> = {};
        Object.values(countyCounts).forEach(({ count, fips }) => {
            if (fips) fipsCounts[fips] = count;
        });

        return NextResponse.json({
            byName: countyCounts,
            byFips: fipsCounts,
            totalCounties: Object.keys(countyCounts).length,
            totalProviders: Object.values(countyCounts).reduce((sum, { count }) => sum + count, 0)
        });
    } catch (error) {
        console.error('Error loading census summary:', error);
        return NextResponse.json({ byName: {}, byFips: {}, totalCounties: 0, totalProviders: 0 }, { status: 500 });
    }
}
