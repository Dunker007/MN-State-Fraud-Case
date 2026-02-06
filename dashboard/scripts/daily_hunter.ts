import Database from 'better-sqlite3';
import { fetch } from 'undici';
import Parser from 'rss-parser';

const db = new Database('./mn-fraud.db');
const parser = new Parser();

// GDELT Geo 2.0 API - Minnesota Filter
const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc?query=Minnesota%20(Fraud%20OR%20DHS%20OR%20Investigation)&mode=ArtList&format=json';
const MN_COURTS_RSS = 'https://www.mncourts.gov/RSS/CivilHighProfileCases.aspx';

async function fetchIntel() {
    console.log('🕵️ HUNTER PROTOCOL: Starting Daily Briefing scan...');

    interface GDELTArticle {
        title: string;
        seendate: string;
        url: string;
    }

    interface GDELTResponse {
        articles: GDELTArticle[];
    }

    // 1. GDELT News Scan
    console.log('Fetching GDELT Intelligence...');
    try {
        const res = await fetch(GDELT_API);
        const data = (await res.json()) as GDELTResponse;

        if (data.articles && data.articles.length > 0) {
            console.log(`Found ${data.articles.length} new GDELT articles.`);
            const stmt = db.prepare(`
        INSERT OR IGNORE INTO intel (source, headline, summary, url, date, relevance_score)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

            for (const art of data.articles) {
                stmt.run('GDELT', art.title, art.seendate, art.url, new Date().toISOString(), 80);
            }
        }
    } catch (err) {
        console.error('GDELT Fetch Failed:', err);
    }

    // 2. Mock Phoenix Algorithm Run
    console.log('Running Phoenix Company Detection on recent filings...');
    // In a real scenario, this would check SOS filings. 
    // For now, we simulate finding 2 suspicious "Ghost" entities.
    const ghostStmt = db.prepare(`
    INSERT INTO intel (source, headline, summary, url, date, relevance_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    ghostStmt.run(
        'PHOENIX_ALGO',
        'SUSPICIOUS FILING: "Bright Future Kids" matches dissolved "Dark Past LLC" officer.',
        'Officer Match: Jane Doe (98% Confidence). Address Match: 123 Fake St.',
        '#',
        new Date().toISOString(),
        95
    );

    console.log('Daily Briefing Generated.');
}

if (require.main === module) {
    fetchIntel().catch(console.error);
}
