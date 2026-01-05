import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;
    const url = new URL(request.url);
    const source = url.searchParams.get('source');

    let docPath = '';
    if (source === 'census') {
        docPath = path.join(process.cwd(), 'data', 'master-census', filename);
    } else {
        docPath = path.join(process.cwd(), 'data', 'dhs-monitor', 'historical-docs', filename);
    }

    if (!existsSync(docPath)) {
        return new NextResponse('Document not found', { status: 404 });
    }

    try {
        const fileBuffer = await readFile(docPath);
        const extension = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';

        if (extension === '.pdf') contentType = 'application/pdf';
        if (extension === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        if (extension === '.csv') contentType = 'text/csv';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${filename}"`,
            },
        });
    } catch (error) {
        return new NextResponse('Error reading document', { status: 500 });
    }
}
