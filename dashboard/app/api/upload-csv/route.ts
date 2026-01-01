import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to project root (2 levels up from app/api/upload-csv)
        // Note: In Next.js dev, process.cwd() is usually the project root
        const uploadDir = process.cwd();
        const filePath = join(uploadDir, file.name);

        await writeFile(filePath, buffer);
        console.log(`Saved ${file.name} to ${filePath}`);

        return NextResponse.json({ success: true, message: `Saved ${file.name}` });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
