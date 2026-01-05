import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'dhs-monitor', 'excuse-log.json');
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContents);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error loading excuse log:', error);
        return NextResponse.json(
            { error: 'Failed to load excuse log', incidents: [], total_checks: 0 },
            { status: 500 }
        );
    }
}
