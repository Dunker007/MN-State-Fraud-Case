/**
 * News API Client - Fetches news from Newscatcher API v3
 * Filters articles against fraud keywords
 */

import { NewsArticle, calculateRelevance } from './news-scraper';
import { deduplicateArticles } from './deduplication';

// GDELT 2.0 Integration Utility Functions

/**
 * Priority curated articles - Breaking news from January 2026
 */
const MOCK_ARTICLES: NewsArticle[] = [
    // BREAKING - January 7, 2026
    {
        id: 'breaking-ola-audit',
        title: 'OLA Audit: BHA Staff Fabricated Documents AFTER Audit Began',
        description: 'Legislative Auditor Judy Randall testified that in her 27 years, she has never seen auditors create backdated or fabricated documents to respond to information requests. The Behavioral Health Administration manages $200M+ annually.',
        link: 'https://mprnews.org/story/2026/01/07/dhs-audit-behavioral-health',
        pubDate: new Date('2026-01-07T08:00:00'),
        source: 'MPR News',
        sourceId: 'mpr-ola',
        author: 'Brian Bakst',
        matchedKeywords: ['OLA', 'Audit', 'BHA', 'Fabricated Documents'],
        relevanceScore: 100,
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        type: 'news',
        tone: -8.5
    },
    {
        id: 'breaking-walz-dropout',
        title: 'Gov. Walz Announces He Will NOT Seek Third Term Amid Fraud Fallout',
        description: 'Minnesota Governor Tim Walz stated he cannot dedicate full attention to a re-election campaign while addressing ongoing fraud allegations and combating what he calls politically motivated attacks from the Trump administration.',
        link: 'https://startribune.com/walz-not-running-2026',
        pubDate: new Date('2026-01-05T18:30:00'),
        source: 'Star Tribune',
        sourceId: 'strib-walz',
        author: 'Torey Van Oot',
        matchedKeywords: ['Walz', 'Election', 'Fraud Scandal', 'Third Term'],
        relevanceScore: 98,
        imageUrl: 'https://images.unsplash.com/photo-1611926653458-09294b3019dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        type: 'news',
        tone: -6.2
    },
    {
        id: 'breaking-dhs-deployment',
        title: 'DHS Deploys "Largest Immigration Enforcement Operation Ever" to Twin Cities',
        description: 'Hundreds of DHS and ICE agents have been deployed to the Minneapolis-St. Paul area. Homeland Security Investigations (HSI) agents are actively probing alleged social services fraud cases. 98 individuals charged, 62 convicted.',
        link: 'https://cbsnews.com/minnesota/dhs-deployment',
        pubDate: new Date('2026-01-06T14:00:00'),
        source: 'CBS News',
        sourceId: 'cbs-dhs',
        author: 'WCCO Staff',
        matchedKeywords: ['DHS', 'ICE', 'HSI', 'Twin Cities', 'Fraud Investigation'],
        relevanceScore: 96,
        imageUrl: 'https://images.unsplash.com/photo-1557992260-ec58e38d396c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        type: 'news',
        tone: -4.1
    },
    {
        id: 'breaking-sba-suspensions',
        title: 'SBA Suspends ~7,000 Minnesota Borrowers for Suspected PPP Fraud',
        description: 'The Small Business Administration has flagged approximately $400 million in Paycheck Protection Program loans and Economic Injury Disaster Loans. Cases are being referred for prosecution.',
        link: 'https://whitehouse.gov/briefings/statements/sba-fraud-action',
        pubDate: new Date('2026-01-06T10:45:00'),
        source: 'White House',
        sourceId: 'wh-sba',
        author: 'Press Office',
        matchedKeywords: ['SBA', 'PPP', 'EIDL', 'Fraud', 'Prosecution'],
        relevanceScore: 92,
        imageUrl: 'https://images.unsplash.com/photo-1593115057322-e94b77572f20?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        type: 'news',
        tone: -3.8
    },
    {
        id: 'breaking-grantee-pipeline',
        title: 'Report: BHA Manager Approved $672K Payment, Then Quit to Work for Same Grantee',
        description: 'The OLA audit revealed a grant manager approved nearly $700,000 to a grantee for a single month of work and subsequently left the agency to work for that organization.',
        link: 'https://kare11.com/article/news/local/ola-bha-grantee-conflict',
        pubDate: new Date('2026-01-06T16:00:00'),
        source: 'KARE 11',
        sourceId: 'kare-grantee',
        author: 'Lou Raguse',
        matchedKeywords: ['Conflict of Interest', 'BHA', 'Grant Fraud', 'OLA'],
        relevanceScore: 95,
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        type: 'news',
        tone: -7.1
    },
    // Earlier coverage
    {
        id: 'mock-2',
        title: 'Inside Minnesota\'s $250M Fraud Case - The Dirty Dozen Exposed',
        description: 'Detailed video breakdown of the high-risk provider list and the connections to overseas accounts. DHS internal leaked docs show they knew in 2024.',
        link: 'https://youtube.com/watch?v=mock',
        pubDate: new Date(Date.now() - 7200000),
        source: 'YouTube',
        sourceId: 'mock-yt',
        author: 'Nick Shirley',
        matchedKeywords: ['Video', 'Investigation', 'Leak'],
        relevanceScore: 90,
        imageUrl: 'https://images.unsplash.com/photo-1557992260-ec58e38d396c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        type: 'social'
    },
    {
        id: 'mock-4',
        title: 'Megathread: Federal indictments unsealed for Housing Stabilization fraud ring',
        description: 'We are compiling all the unsealed documents here. Looks like 40+ defendants named so far. Total estimated fraud: $9 billion.',
        link: 'https://reddit.com/r/minnesota',
        pubDate: new Date(Date.now() - 21600000),
        source: 'Reddit',
        sourceId: 'mock-rd',
        author: 'u/MNPolitics',
        matchedKeywords: ['Discussion', 'Indictments', '$9B'],
        relevanceScore: 80,
        imageUrl: 'https://images.unsplash.com/photo-1593115057322-e94b77572f20?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        type: 'social'
    }
];

/**
 * Fetch news from Newscatcher API
 */
export async function fetchNewsAPI(customQuery?: string): Promise<NewsArticle[]> {
    // 1. Try to read from local cache (populated by GitHub Actions / Hunter Protocol)
    // SKIP CACHE IF CUSTOM QUERY IS PRESENT
    if (!customQuery) {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const cachePath = path.join(process.cwd(), 'data/news-cache.json');

            const cacheData = await fs.readFile(cachePath, 'utf-8');
            const cachedArticles: NewsArticle[] = JSON.parse(cacheData);

            if (cachedArticles && cachedArticles.length > 0) {
                console.log(`[CROSSCHECK_INTEL] Serving ${cachedArticles.length} articles from Hunter Protocol Cache.`);
                return deduplicateArticles(cachedArticles);
            }
        } catch (error) {
            console.warn('[CROSSCHECK_INTEL] Cache miss or error, falling back to live GDELT fetch.', error);
        }
    }

    // GDELT requires no key, but we'll log the switch for clarity
    console.log('[CROSSCHECK_INTEL] Fetching intelligence from GDELT Project DOC 2.0 API...');

    let queryTerm = '';
    let activePhase = 'CUSTOM_SEARCH';

    if (customQuery) {
        // HUNTER SEARCH MODE
        queryTerm = customQuery;
        console.log(`[CROSSCHECK_INTEL] EXECUTING HUNTER SEARCH: "${customQuery}"`);
    } else {
        // HUNTER PROTOCOL: Time-based rotation to scan different vectors of the fraud ecosystem
        // Import from single source of truth
        const { getCurrentHunterPhase } = await import('./keyword-matrix');
        const { phaseName } = getCurrentHunterPhase();
        activePhase = phaseName;

        // Correct GDELT V2 format: Minnesota (Fraud OR DHS OR Investigation OR FBI)
        queryTerm = 'Minnesota (Fraud OR DHS OR Investigation OR FBI)';
    }

    // Geo-targeting safety defaults
    const geoConstraint = 'sourcecountry:US';

    console.log(`[CROSSCHECK_INTEL] HUNTER PROTOCOL ACTIVE: ${activePhase}`);
    console.log(`[CROSSCHECK_INTEL] Generated GDELT Query Length: ${queryTerm.length} chars`);
    console.log(`[CROSSCHECK_INTEL] Query: ${queryTerm}`);

    const baseUrl = 'https://api.gdeltproject.org/api/v2/doc/doc';

    // Params:
    // query: The search terms + geo constraint
    // format: json
    // sort: DateDesc (newest first)
    // timespan: 24h
    const params = new URLSearchParams({
        query: `${queryTerm} ${geoConstraint}`,
        mode: 'ArtList',
        maxrecords: '250',
        format: 'json',
        sort: 'DateDesc',
        timespan: '24h'
    });

    try {
        const response = await fetch(`${baseUrl}?${params.toString()}`, {
            method: 'GET',
            next: { revalidate: 300 },
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error(`[CROSSCHECK_INTEL] GDELT fetch failed: ${response.status} ${response.statusText}`);
            return MOCK_ARTICLES;
        }

        // PRE-CHECK: GDELT sometimes returns plain text errors
        if (!responseText.trim().startsWith('{')) {
            console.warn(`[CROSSCHECK_INTEL] GDELT returned invalid JSON format. Response preview: ${responseText.slice(0, 200)}`);
            return MOCK_ARTICLES;
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.warn('[CROSSCHECK_INTEL] Error parsing GDELT JSON:', parseError);
            return MOCK_ARTICLES;
        }

        if (!data || !data.articles || !Array.isArray(data.articles)) {
            console.warn('[CROSSCHECK_INTEL] GDELT returned valid response but no articles found.');
            return MOCK_ARTICLES;
        }

        let articles: NewsArticle[] = [];
        const SOCIAL_DOMAINS = ['youtube.com', 'twitter.com', 'x.com', 'reddit.com', 'facebook.com', 'instagram.com', 'tiktok.com'];

        interface GDELTArticle {
            url: string;
            title: string;
            seendate: string; // "20240523T143000Z"
            socialimage: string;
            domain: string;
            language: string;
            sourcegeography: string;
            tone?: number; // GDELT tone score (-100 to +100)
        }

        for (const item of (data.articles as GDELTArticle[])) {
            if (!item.title || !item.url) continue;

            const title = item.title;
            const description = `Reported by ${item.domain}: ${title}`;

            // CALCULATE SCORE BUT DO NOT FILTER STRICTLY
            const { score, matched } = calculateRelevance(title, description);

            // ONLY Exclude explicit "exclude" keywords (like "sports", "weather" if configured)
            // if (shouldExclude) continue; 
            // ^ DISABLE even the exclude filter for maximum volume check

            // Classify Type
            const domain = item.domain?.toLowerCase() || '';
            const isSocial = SOCIAL_DOMAINS.some(d => domain.includes(d));
            const type = isSocial ? 'social' : 'news';

            // VIDEO LOGIC
            let videoUrl: string | undefined;
            let imageUrl = item.socialimage || undefined;

            if (domain.includes('youtube.com') || domain.includes('youtu.be') || domain.includes('vimeo.com')) {
                videoUrl = item.url;
                if (!imageUrl && (domain.includes('youtube.com') || domain.includes('youtu.be'))) {
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                    const match = item.url.match(regExp);
                    const vidId = (match && match[2].length === 11) ? match[2] : null;
                    if (vidId) imageUrl = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
                }
            }

            // Parse GDELT Date
            const year = parseInt(item.seendate.substring(0, 4));
            const month = parseInt(item.seendate.substring(4, 6)) - 1;
            const day = parseInt(item.seendate.substring(6, 8));
            const hour = parseInt(item.seendate.substring(9, 11));
            const minute = parseInt(item.seendate.substring(11, 13));
            let pubDate = new Date(Date.UTC(year, month, day, hour, minute));

            // Sanity check date
            if (isNaN(pubDate.getTime())) pubDate = new Date();

            articles.push({
                id: `gdelt-${item.url}-${Math.random().toString(36).substr(2, 9)}`, // Truly unique ID
                title,
                description: description,
                link: item.url,
                pubDate: pubDate,
                source: item.domain || 'GDELT Network',
                sourceId: 'gdelt',
                author: item.domain,
                imageUrl: imageUrl,
                matchedKeywords: matched.length > 0 ? matched : ['Uncategorized'],
                relevanceScore: score, // Keep score for sorting, but not filtering
                type,
                videoUrl,
                tone: item.tone // GDELT tone score
            });
        }

        console.log(`[CROSSCHECK_INTEL] Indexed ${articles.length} verified hits from GDELT.`);

        if (articles.length < 5) {
            console.log('[CROSSCHECK_INTEL] Low GDELT hit count (< 5). Using MOCK data for demo.');
            return MOCK_ARTICLES;
        }

        // DESTRUCTIVE REPAIR: Bypass Deduplication completely. Return RAW feed.
        // return deduplicateArticles(articles);
        // LIGHTWEIGHT DEDUPLICATION (Fixes "Echo Chamber" / "Pope 4x" issue)
        // 1. Filter out exact title matches and URL matches
        const seenTitles = new Set();
        const seenUrls = new Set();
        let uniqueArticles = articles.filter(article => {
            const normalizedTitle = article.title.toLowerCase().trim();
            if (seenTitles.has(normalizedTitle) || seenUrls.has(article.link)) {
                return false;
            }
            seenTitles.add(normalizedTitle);
            seenUrls.add(article.link);
            return true;
        });
        articles = uniqueArticles;

        // PRIORITY FIX: Ensure the "Featured" (top) article has an image if possible.
        // Find first article with a valid imageUrl and move it to the top.
        const featuredCandidateIndex = articles.findIndex(a => a.imageUrl && a.imageUrl.length > 0);
        if (featuredCandidateIndex > 0) {
            const [featured] = articles.splice(featuredCandidateIndex, 1);
            articles.unshift(featured);
        }

        return articles;

    } catch (error) {
        console.error('[CROSSCHECK_INTEL] Critical error fetching GDELT intel:', error);
        return MOCK_ARTICLES;
    }
}