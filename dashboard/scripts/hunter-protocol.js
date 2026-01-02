const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const CACHE_FILE = path.join(__dirname, '../data/news-cache.json');
const MAX_CACHE_AGE_HOURS = 48;
const MAX_CACHE_SIZE = 200; // Keep top 200 most relevant/recent

// --- KEYWORD MATRIX (Matches dashboard/lib/news-api.ts) ---
const KEYWORD_MATRIX = {
    highValueTargets: [
        '"Nick Shirley"',
        '"Tim Walz" "Fraud"',
        '"Jodi Harpstead"',
        '"Keith Ellison" "Fraud"',
        '"Feeding Our Future"',
        '"Aimee Bock"',
        '"MN DHS Inspector General"',
        '"Liz Collin" "Alpha News"'
    ],
    honeyPots: [
        '"CCAP" "Fraud"',
        '"Child Care Assistance" "Fraud"',
        '"Personal Care Assistant" "Fraud"',
        '"Autism Center" "Investigation"',
        '"Adult Day Care" "Fraud"',
        '"Waivered Services"',
        '"EIDBI" OR "Early Intensive Developmental"',
        '"MFIP Fraud"'
    ],
    mechanisms: [
        '"Ghost Employee"',
        '"Billing for dead"',
        '"Kickback scheme"',
        '"Shell company" "Fraud"',
        '"Identity theft" "Daycare"',
        '"False claims" "Medicaid"',
        '"Wire fraud" "Minnesota"',
        '"Pay-to-play"'
    ],
    spiderweb: [
        '"Overseas transfer Minnesota"',
        '"RICO Minnesota"',
        '"Federal indictment Minnesota"',
        '"Whistleblower DHS"',
        '"FBI raid Minnesota"',
        '"US Attorney Minnesota"',
        '"Retaliation DHS employee"'
    ]
};

// --- SCORING & FILTERING (Simplified from dashboard/lib/news-scraper.ts) ---
function calculateRelevance(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    // 1. Exclusions
    const EXCLUDE_KEYWORDS = [
        'nfl', 'nba', 'mlb', 'nhl', 'ncaa', 'super bowl', 'playoffs',
        'vikings', 'twins', 'timberwolves', 'wild', 'gophers',
        'sports', 'game', 'score', 'touchdown', 'basketball', 'baseball', 'hockey',
        'movie', 'film', 'tv show', 'entertainment', 'celebrity', 'actor', 'actress',
        'grammy', 'oscar', 'emmy', 'music video', 'album', 'concert', 'tour',
        'recipe', 'cooking', 'restaurant review', 'food critic', 'weather forecast'
    ];

    if (EXCLUDE_KEYWORDS.some(k => text.includes(k))) {
        return { score: 0, matched: [], shouldExclude: true };
    }

    // 2. Fraud Keywords Scoring
    const FRAUD_KEYWORDS = [
        { term: 'feeding our future', weight: 15 },
        { term: 'medicaid fraud minnesota', weight: 15 },
        { term: 'fof fraud', weight: 10 },
        { term: 'grumdahl', weight: 9 },
        { term: 'harpstead', weight: 9 },
        { term: 'aimee bock', weight: 9 },
        { term: 'daycare fraud', weight: 8 },
        { term: 'childcare fraud', weight: 8 },
        { term: '$250 million', weight: 8 },
        { term: 'billion dollar fraud', weight: 8 },
        { term: 'minnesota fraud', weight: 7 },
        { term: 'dhs fraud', weight: 7 },
        { term: 'walz fraud', weight: 7 },
        { term: 'welfare fraud', weight: 6 },
        { term: 'pca fraud', weight: 6 },
        { term: 'home care fraud', weight: 6 },
        { term: 'al-shabaab', weight: 10 },
        { term: 'terror financing', weight: 9 },
        { term: 'federal indictment', weight: 5 },
    ];

    let score = 0;
    let matched = [];

    // Basic scoring
    for (const { term, weight } of FRAUD_KEYWORDS) {
        if (text.includes(term.replace(/"/g, ''))) {
            score += weight;
            matched.push(term);
        }
    }

    // Boost if any matrix keyword matches exactly
    const allMatrixTerms = Object.values(KEYWORD_MATRIX).flat().map(t => t.replace(/"/g, '').toLowerCase());
    for (const term of allMatrixTerms) {
        if (text.includes(term)) {
            score += 5; // Base boost for relevant topics
        }
    }

    return { score, matched, shouldExclude: false };
}

// --- MAIN FETCH LOGIC ---
async function fetchHunterProtocol() {
    const minutes = new Date().getMinutes();
    let phaseKeywords = [];
    let activePhase = '';
    let geoConstraint = 'sourcecountry:US'; // Default

    if (minutes < 15) {
        activePhase = 'PHASE 1: HIGH VALUE TARGETS';
        phaseKeywords = KEYWORD_MATRIX.highValueTargets;
    } else if (minutes < 30) {
        activePhase = 'PHASE 2: HONEY POTS';
        phaseKeywords = KEYWORD_MATRIX.honeyPots;
    } else if (minutes < 45) {
        activePhase = 'PHASE 3: MECHANISMS & TACTICS';
        phaseKeywords = KEYWORD_MATRIX.mechanisms;
    } else {
        activePhase = 'PHASE 4: THE SPIDERWEB';
        phaseKeywords = KEYWORD_MATRIX.spiderweb;
    }

    console.log(`[HUNTER PROTOCOL] Executing ${activePhase}`);

    // Construct GDELT Query
    const queryTerm = `(${phaseKeywords.join(' OR ')})`;
    const baseUrl = 'https://api.gdeltproject.org/api/v2/doc/doc';
    const params = new URLSearchParams({
        query: `${queryTerm} ${geoConstraint}`,
        mode: 'ArtList',
        maxrecords: '100',
        format: 'json',
        sort: 'DateDesc',
        timespan: '15m' // Only fetch last 15 mins to avoid huge overlaps, relying on cache for history
    });

    try {
        const url = `${baseUrl}?${params.toString()}`;
        console.log(`[HUNTER PROTOCOL] Fetching: ${url}`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`GDELT API returned ${response.status}`);

        const data = await response.json();

        if (!data.articles || !Array.isArray(data.articles)) {
            console.log('[HUNTER PROTOCOL] No new articles found in this phase.');
            return [];
        }

        const SOCIAL_DOMAINS = ['youtube.com', 'twitter.com', 'x.com', 'reddit.com', 'facebook.com', 'instagram.com', 'tiktok.com'];
        const newArticles = [];

        for (const item of data.articles) {
            if (!item.title || !item.url) continue;

            const title = item.title;
            const description = `Reported by ${item.domain} regarding: ${title}`;
            const { score, matched, shouldExclude } = calculateRelevance(title, description);

            if (shouldExclude) continue;
            // GDELT is cleaner, but minimal score check
            if (score === 0 && matched.length === 0) {
                // Keep if it matches a specific matrix keyword even if score is low
                const isRelevant = Object.values(KEYWORD_MATRIX).flat().some(k =>
                    title.toLowerCase().includes(k.replace(/"/g, '').toLowerCase())
                );
                if (!isRelevant) continue;
            }

            const domain = item.domain?.toLowerCase() || '';
            const isSocial = SOCIAL_DOMAINS.some(d => domain.includes(d));

            // Parse Date "20240523T143000Z"
            const seendate = item.seendate;
            const pubDate = new Date(Date.UTC(
                parseInt(seendate.substring(0, 4)),
                parseInt(seendate.substring(4, 6)) - 1,
                parseInt(seendate.substring(6, 8)),
                parseInt(seendate.substring(9, 11)),
                parseInt(seendate.substring(11, 13))
            ));

            newArticles.push({
                id: `gdelt-${item.url}`,
                title,
                description,
                link: item.url,
                pubDate: pubDate.toISOString(),
                source: item.domain || 'GDELT',
                sourceId: 'gdelt',
                author: item.domain,
                imageUrl: item.socialimage || undefined,
                matchedKeywords: matched,
                relevanceScore: score > 0 ? score : 50,
                type: isSocial ? 'social' : 'news',
                fetchedAt: new Date().toISOString()
            });
        }

        console.log(`[HUNTER PROTOCOL] Found ${newArticles.length} valid articles.`);
        return newArticles;

    } catch (error) {
        console.error('[HUNTER PROTOCOL] Error:', error);
        return [];
    }
}

// --- UPDATE CACHE ---
async function main() {
    try {
        // 1. Load existing cache
        let cache = [];
        if (fs.existsSync(CACHE_FILE)) {
            try {
                const raw = fs.readFileSync(CACHE_FILE, 'utf8');
                cache = JSON.parse(raw);
            } catch (e) {
                console.error('Error reading cache file, starting fresh.');
            }
        }

        // 2. Fetch new
        const newArticles = await fetchHunterProtocol();

        // 3. Merge
        let updatedCount = 0;
        const cacheMap = new Map(cache.map(a => [a.id, a]));

        for (const article of newArticles) {
            if (!cacheMap.has(article.id)) {
                cacheMap.set(article.id, article);
                updatedCount++;
            }
        }

        // 4. Prune (Old or Too Many)
        let merged = Array.from(cacheMap.values());

        // Sort by date desc
        merged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Filter out very old items (e.g. > 48h) unless they are essentially high score?
        // Let's just keep last 48h for now.
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - MAX_CACHE_AGE_HOURS);

        merged = merged.filter(a => new Date(a.pubDate) > cutoff);

        // Cap size
        if (merged.length > MAX_CACHE_SIZE) {
            merged = merged.slice(0, MAX_CACHE_SIZE);
        }

        // 5. Save
        fs.writeFileSync(CACHE_FILE, JSON.stringify(merged, null, 2));
        console.log(`[HUNTER PROTOCOL] Cache updated. Added ${updatedCount} new articles. Total: ${merged.length}`);

    } catch (error) {
        console.error('[HUNTER PROTOCOL] Critical failure:', error);
        process.exit(1);
    }
}

main();
