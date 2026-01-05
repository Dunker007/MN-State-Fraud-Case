import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ timestamp: string }> }
) {
    const { timestamp } = await params;
    // Screenshots are named ss_TIMESTAMP.png
    const filename = `ss_${timestamp}.png`;
    const screenshotPath = path.join(
        process.cwd(),
        'data',
        'dhs-monitor',
        'wayback-archive',
        'screenshots',
        filename
    );

    if (!existsSync(screenshotPath)) {
        return new NextResponse('Screenshot not found', { status: 404 });
    }

    try {
        const imageBuffer = await readFile(screenshotPath);
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        return new NextResponse('Error reading screenshot', { status: 500 });
    }
}
