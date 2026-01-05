/**
 * Bulk HTML to Image Renderer (Ultra-Resilient Version)
 * Uses Playwright to render downloaded Wayback Machine HTML snapshots
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SNAPSHOT_DIR = path.join(__dirname, '..', 'data', 'dhs-monitor', 'wayback-archive');
const SCREENSHOT_DIR = path.join(SNAPSHOT_DIR, 'screenshots');

async function renderSnapshots() {
    console.log('=== DHS Archive Visual Capture (Ultra-Resilient) ===');

    if (!fs.existsSync(SNAPSHOT_DIR)) {
        console.error('Source directory not found:', SNAPSHOT_DIR);
        return;
    }

    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    const files = fs.readdirSync(SNAPSHOT_DIR)
        .filter(f => f.startsWith('snapshot_') && f.endsWith('.html'))
        .sort();

    console.log(`Found ${files.length} snapshots to render...`);

    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1024 },
        ignoreHTTPSErrors: true
    });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = file.replace('snapshot_', '').replace('.html', '');
        const outputPath = path.join(SCREENSHOT_DIR, `ss_${timestamp}.png`);

        if (fs.existsSync(outputPath)) {
            continue;
        }

        console.log(`[${i + 1}/${files.length}] Rendering: ${file}`);
        const page = await context.newPage();

        try {
            const filePath = `file://${path.join(SNAPSHOT_DIR, file)}`;

            try {
                // Minimum wait for content to be parsed
                await page.goto(filePath, {
                    waitUntil: 'load',
                    timeout: 8000
                });
            } catch (gotoError) {
                console.log(`  Paced load failed, attempting screenshot anyway...`);
            }

            // Wait slightly for any internal JS/Styles
            await new Promise(r => setTimeout(r, 1000));

            // Ultra-safe background forcing
            await page.evaluate(() => {
                if (document.documentElement) {
                    document.documentElement.style.backgroundColor = 'white';
                }
                if (document.body) {
                    document.body.style.backgroundColor = 'white';
                }
            }).catch(() => { });

            console.log(`  Taking screenshot...`);
            await page.screenshot({
                path: outputPath,
                fullPage: true,
                timeout: 5000 // Don't let screenshot hang
            });

            if (fs.existsSync(outputPath)) {
                console.log(`  ✅ Success: ${path.basename(outputPath)}`);
            }

        } catch (error) {
            console.error(`  ❌ ERROR rendering ${file}:`, error.message);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log('\n=== Visual Capture Complete ===');
}

renderSnapshots().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
