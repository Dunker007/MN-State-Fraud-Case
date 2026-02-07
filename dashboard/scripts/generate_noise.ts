
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateNoise() {
    const width = 512;
    const height = 512;
    // Create a buffer for raw pixel data (RGBA)
    const buffer = Buffer.alloc(width * height * 4);

    for (let i = 0; i < width * height; i++) {
        const offset = i * 4;
        const value = Math.floor(Math.random() * 255);
        buffer[offset] = value;     // R
        buffer[offset + 1] = value; // G
        buffer[offset + 2] = value; // B
        // Vary alpha for "static" feel, mainly transparent
        buffer[offset + 3] = Math.floor(Math.random() * 30);
    }

    try {
        await sharp(buffer, {
            raw: {
                width,
                height,
                channels: 4
            }
        })
            .png()
            .toFile(path.join(process.cwd(), 'public', 'noise.png'));

        console.log('✅ Generated public/noise.png');
    } catch (err) {
        console.error('Failed to generate noise:', err);
    }
}

generateNoise();
