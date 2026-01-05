import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const county = searchParams.get('county') || 'Hennepin';

    // Normalize filename: St. Louis -> St_Louis, Big Stone -> Big_Stone
    const filename = county.replace(/\./g, '').replace(/ /g, '_');

    try {
        // Load providers CSV
        const providersPath = path.join(process.cwd(), 'data', 'master-census', `${filename}_providers.csv`);
        const providersContent = await fs.readFile(providersPath, 'utf8');

        // Parse CSV
        const lines = providersContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        const providers = lines.slice(1).map(line => {
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (const char of line) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const record: Record<string, string> = {};
            headers.forEach((h, i) => {
                record[h] = values[i] || '';
            });
            return record;
        });

        return NextResponse.json({
            county,
            count: providers.length,
            providers
        });
    } catch (error) {
        console.error(`Error loading ${county} providers:`, error);
        return NextResponse.json(
            { county, count: 0, providers: [], error: `No data for ${county}` },
            { status: 404 }
        );
    }
}
