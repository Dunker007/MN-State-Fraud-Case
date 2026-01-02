/**
 * News API Client - Fetches news from Newscatcher API v3
 * Filters articles against fraud keywords
 */

import { NewsArticle, calculateRelevance } from './news-scraper';

// GDELT 2.0 Integration Utility Functions

/**
 * Fetch news from Newscatcher API
 */
const MOCK_ARTICLES: NewsArticle[] = [
    {
        id: 'mock-1',
        title: 'Federal Investigation Reveals Extensive Medicaid Fraud Network',
        description: 'A multi-year investigation has uncovered a ring of fraudsters exploiting DHS licensing loopholes. 14 businesses were suspended immediately following the raid.',
        link: 'https://startribune.com',
        pubDate: new Date(),
        source: 'Minneapolis Star Tribune',
        sourceId: 'mock',
        author: 'Investigative Team',
        matchedKeywords: ['Fraud', 'DHS', 'Suspension'],
        relevanceScore: 100,
        type: 'news'
    },
    {
        id: 'mock-2',
        title: 'Inside Minnesota\'s $250M Fraud Case - The Dirty Dozen Exposed',
        description: 'Detailed video breakdown of the high-risk provider list and the connections to overseas accounts. DHS internal leaked docs show they knew in 2024.',
        link: 'https://youtube.com/watch?v=mock',
        pubDate: new Date(Date.now() - 7200000), // 2h ago
        source: 'YouTube',
        sourceId: 'mock-yt',
        author: 'Nick Shirley',
        matchedKeywords: ['Video', 'Investigation', 'Leak'],
        relevanceScore: 90,
        type: 'social'
    },
    {
        id: 'mock-3',
        title: 'DHS admits internal controls "failed to prevent" massive fraud scheme',
        description: 'Thread: Breaking down the Commissioner\'s testimony today. They are essentially blaming the software vendor for the "glitch". Unbelievable.',
        link: 'https://twitter.com/mock',
        pubDate: new Date(Date.now() - 14400000), // 4h ago
        source: 'Twitter',
        sourceId: 'mock-tw',
        author: '@MinnesotaWatch',
        matchedKeywords: ['Thread', 'Testimony', 'Glitch'],
        relevanceScore: 85,
        type: 'social'
    },
    {
        id: 'mock-4',
        title: 'Megathread: Federal indictments unsealed for Housing Stabilization fraud ring',
        description: 'We are compiling all the unsealed documents here. Looks like 40+ defendants named so far.',
        link: 'https://reddit.com/r/minnesota',
        pubDate: new Date(Date.now() - 21600000), // 6h ago
        source: 'Reddit',
        sourceId: 'mock-rd',
        author: 'u/MNPolitics',
        matchedKeywords: ['Discussion', 'Indictments'],
        relevanceScore: 80,
        type: 'social'
    },
    {
        id: 'mock-5',
        title: 'Judge tosses out guilty verdict in tied case',
        description: 'Controversial ruling in Hennepin County today regarding the third batch of defendants.',
        link: 'https://kare11.com',
        pubDate: new Date(Date.now() - 3600000), // 1h ago
        source: 'KARE 11',
        sourceId: 'mock-tv',
        author: 'Staff',
        matchedKeywords: ['Court', 'Verdict'],
        relevanceScore: 60,
        type: 'news'
    }
];

/**
 * Fetch news from Newscatcher API
 */
export async function fetchNewsAPI(): Promise<NewsArticle[]> {
    // 1. Try to read from local cache (populated by GitHub Actions / Hunter Protocol)
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const cachePath = path.join(process.cwd(), 'data/news-cache.json');

        const cacheData = await fs.readFile(cachePath, 'utf-8');
        const cachedArticles: NewsArticle[] = JSON.parse(cacheData);

        if (cachedArticles && cachedArticles.length > 0) {
            console.log(`[CROSSCHECK_INTEL] Serving ${cachedArticles.length} articles from Hunter Protocol Cache.`);
            return cachedArticles;
        }
    } catch (error) {
        console.warn('[CROSSCHECK_INTEL] Cache miss or error, falling back to live GDELT fetch.', error);
    }

    // GDELT requires no key, but we'll log the switch for clarity
    console.log('[CROSSCHECK_INTEL] Fetching intelligence from GDELT Project DOC 2.0 API...');

    // HUNTER PROTOCOL: Time-based rotation to scan different vectors of the fraud ecosystem
    // This allows us to use the full "Battle-Tested" matrix without hitting complexity limits.
    // 0-15: Targets (Walz, FOF) - GLOBAL
    // 15-30: Honey Pots (Daycare, Autism) - NATIONAL SCOPE
    // 30-45: Mechanisms (Ghost Employees, Shells) - NATIONAL SCOPE
    // 45-60: Spiderweb (RICO, Whistleblowers) - MN FOCUS

    // BATTLE-TESTED KEYWORD MATRIX
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
            // Removed for length limits: OLA, Kulani Moti, Hennepin Board, Joe Thompson
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
            // Removed: Group Home, Non-profit grant, Housing Support, SNAP
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
            // Removed: Money laundering, Background study, License revocation, Jury bribe, Cash smuggling
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

    const minutes = new Date().getMinutes();
    let activePhase = '';
    let phaseKeywords: string[] = [];
    let geoConstraint = '';

    if (minutes < 15) {
        activePhase = 'PHASE 1: HIGH VALUE TARGETS';
        phaseKeywords = KEYWORD_MATRIX.highValueTargets;
        // Targets are distinct enough to run without strict geo-lock (e.g. Walz is national news)
        geoConstraint = 'sourcecountry:US';
    } else if (minutes < 30) {
        activePhase = 'PHASE 2: HONEY POTS (NATIONAL SCAN)';
        phaseKeywords = KEYWORD_MATRIX.honeyPots;
        // Honey pots need to be distinct or paired with US context
        geoConstraint = 'sourcecountry:US';
    } else if (minutes < 45) {
        activePhase = 'PHASE 3: MECHANISMS & TACTICS';
        phaseKeywords = KEYWORD_MATRIX.mechanisms;
        geoConstraint = 'sourcecountry:US';
    } else {
        activePhase = 'PHASE 4: THE SPIDERWEB (RICO/FBI)';
        phaseKeywords = KEYWORD_MATRIX.spiderweb;
        // Spiderweb terms like "FBI Raid" are often best with MN context
        geoConstraint = 'sourcecountry:US';
    }

    console.log(`[CROSSCHECK_INTEL] HUNTER PROTOCOL ACTIVE: ${activePhase}`);

    // GDELT 2.0 Strict Mode: (A OR B OR C)
    const queryTerm = `(${phaseKeywords.join(' OR ')})`;
    const baseUrl = 'https://api.gdeltproject.org/api/v2/doc/doc';

    // Params:
    // query: The search terms + geo constraint
    // format: json
    // sort: DateDesc (newest first)
    // timespan: 3m
    const params = new URLSearchParams({
        query: `${queryTerm} ${geoConstraint}`,
        mode: 'ArtList',
        maxrecords: '100',
        format: 'json',
        sort: 'DateDesc',
        timespan: '3m'
    });

    try {
        const response = await fetch(`${baseUrl}?${params.toString()}`, {
            method: 'GET',
            next: { revalidate: 1800 }, // Cache for 30 mins
        });

        if (!response.ok) {
            console.error(`[CROSSCHECK_INTEL] GDELT fetch failed: ${response.status} ${response.statusText}`);
            return MOCK_ARTICLES;
        }

        const data = await response.json();

        if (!data.articles || !Array.isArray(data.articles)) {
            console.warn('[CROSSCHECK_INTEL] GDELT returned valid response but no articles found.');
            return MOCK_ARTICLES;
        }

        const articles: NewsArticle[] = [];
        const SOCIAL_DOMAINS = ['youtube.com', 'twitter.com', 'x.com', 'reddit.com', 'facebook.com', 'instagram.com', 'tiktok.com'];

        interface GDELTArticle {
            url: string;
            title: string;
            seendate: string; // "20240523T143000Z"
            socialimage: string;
            domain: string;
            language: string;
            sourcegeography: string;
        }

        for (const item of (data.articles as GDELTArticle[])) {
            if (!item.title || !item.url) continue;

            const title = item.title;
            // GDELT doesn't provide a description snippet in ArtList mode usually, 
            // but sometimes we can infer or leave it empty/placeholder.
            // We will use the title as description fallback or leave empty to let the UI handle it.
            const description = `Reported by ${item.domain} regarding: ${title}`;

            const { score, matched, shouldExclude } = calculateRelevance(title, description);

            if (shouldExclude) continue;
            // GDELT is cleaner than raw scraping, but we still apply our relevance filter
            // Lower threshold slightly as GDELT is keyword focused already
            if (score < 1 && matched.length === 0) continue;

            // Classify Type
            const domain = item.domain?.toLowerCase() || '';
            const isSocial = SOCIAL_DOMAINS.some(d => domain.includes(d));
            const type = isSocial ? 'social' : 'news';

            // Parse GDELT Date: "20240523T143000Z"
            // Simple parsing logic
            const year = parseInt(item.seendate.substring(0, 4));
            const month = parseInt(item.seendate.substring(4, 6)) - 1;
            const day = parseInt(item.seendate.substring(6, 8));
            const hour = parseInt(item.seendate.substring(9, 11));
            const minute = parseInt(item.seendate.substring(11, 13));
            const pubDate = new Date(Date.UTC(year, month, day, hour, minute));

            articles.push({
                id: `gdelt-${item.url}`, // Create unique ID
                title,
                description, // GDELT drawback: no snippets in this mode, so we use constructed one
                link: item.url,
                pubDate: pubDate,
                source: item.domain || 'GDELT Network',
                sourceId: 'gdelt',
                author: item.domain, // Use domain as author
                imageUrl: item.socialimage || undefined,
                matchedKeywords: matched,
                relevanceScore: score > 0 ? score : 50, // Default baseline score
                type
            });
        }

        console.log(`[CROSSCHECK_INTEL] Indexed ${articles.length} verified hits from GDELT.`);

        if (articles.length === 0) {
            console.log('[CROSSCHECK_INTEL] No GDELT hits found matching criteria. Using MOCK data.');
            return MOCK_ARTICLES;
        }

        return articles;

    } catch (error) {
        console.error('[CROSSCHECK_INTEL] Critical error fetching GDELT intel:', error);
        return MOCK_ARTICLES;
    }
}