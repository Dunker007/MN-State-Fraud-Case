
/**
 * News Sources Configuration
 * Defines all tracked sources for the Live Intel Feed
 */

export interface NewsSource {
    id: string;
    name: string;
    type: 'rss' | 'youtube' | 'api' | 'scrape';
    url: string;
    priority: 'primary' | 'secondary';
    keywords?: string[]; // Optional keyword filter for this source
}

export interface TrackedReporter {
    id: string;
    name: string;
    outlet: string;
    platform: 'news' | 'youtube' | 'twitter';
    profileUrl: string;
    feedUrl?: string;
    isPrimary: boolean;
}

// Keywords to match articles against
export const FRAUD_KEYWORDS = [
    'Minnesota fraud',
    'MN fraud',
    'DHS fraud',
    'Feeding Our Future',
    'FOF fraud',
    'daycare fraud',
    'welfare fraud',
    'Walz fraud',
    'Harpstead',
    'Grumdahl',
    'Aimee Bock',
    'federal indictment Minnesota',
    'billion dollar fraud',
    '$250 million fraud',
    'Al-Shabaab',
    'terror financing',
    'PCA fraud',
    'home care fraud',
    'CCAP fraud',
    'childcare fraud minnesota',
];

// RSS and API sources
export const NEWS_SOURCES: NewsSource[] = [
    // Primary local sources
    {
        id: 'alpha-news',
        name: 'Alpha News',
        type: 'rss',
        url: 'https://alphanews.org/feed/',
        priority: 'primary',
    },
    {
        id: 'star-tribune',
        name: 'Star Tribune',
        type: 'rss',
        url: 'https://www.startribune.com/local/rss.xml',
        priority: 'primary',
    },
    {
        id: 'mpr-news',
        name: 'MPR News',
        type: 'rss',
        url: 'https://www.mprnews.org/rss.xml',
        priority: 'primary',
    },
    {
        id: 'pioneer-press',
        name: 'Pioneer Press',
        type: 'rss',
        url: 'https://www.twincities.com/feed/',
        priority: 'secondary',
    },
    // National/Federal sources
    {
        id: 'doj-press',
        name: 'DOJ Press Releases',
        type: 'rss',
        url: 'https://www.justice.gov/rss.xml',
        priority: 'primary',
        keywords: ['Minnesota', 'fraud', 'Feeding Our Future'],
    },
    {
        id: 'fbi-press',
        name: 'FBI Press Releases',
        type: 'rss',
        url: 'https://www.fbi.gov/rss.xml',
        priority: 'secondary',
        keywords: ['Minnesota', 'fraud'],
    },
];

// YouTube channels to monitor
export const YOUTUBE_SOURCES: NewsSource[] = [
    {
        id: 'nick-shirley',
        name: 'Nick Shirley',
        type: 'youtube',
        url: 'https://www.youtube.com/@NickShirley', // Will need channel ID for API
        priority: 'primary',
    },
];

// Key reporters to track
export const TRACKED_REPORTERS: TrackedReporter[] = [
    {
        id: 'liz-collin',
        name: 'Liz Collin',
        outlet: 'Alpha News',
        platform: 'news',
        profileUrl: 'https://alphanews.org/?s=liz+collin',
        feedUrl: 'https://alphanews.org/feed/',
        isPrimary: true,
    },
    {
        id: 'nick-shirley',
        name: 'Nick Shirley',
        outlet: 'YouTube',
        platform: 'youtube',
        profileUrl: 'https://www.youtube.com/@NickShirley',
        isPrimary: true,
    },
    {
        id: 'jeff-hargarten',
        name: 'Jeff Hargarten',
        outlet: 'Star Tribune',
        platform: 'news',
        profileUrl: 'https://www.startribune.com/jeff-hargarten/440928903/',
        isPrimary: false,
    },
    {
        id: 'briana-bierschbach',
        name: 'Briana Bierschbach',
        outlet: 'Star Tribune',
        platform: 'news',
        profileUrl: 'https://www.startribune.com/briana-bierschbach/6370568/',
        isPrimary: false,
    },
    {
        id: 'brian-bakst',
        name: 'Brian Bakst',
        outlet: 'MPR News',
        platform: 'news',
        profileUrl: 'https://www.mprnews.org/people/brian-bakst',
        isPrimary: false,
    },
    {
        id: 'ryan-faircloth',
        name: 'Ryan Faircloth',
        outlet: 'Star Tribune',
        platform: 'news',
        profileUrl: 'https://www.startribune.com/ryan-faircloth/600172879/',
        isPrimary: false,
    },
];

// All sources combined
export const ALL_SOURCES = [...NEWS_SOURCES, ...YOUTUBE_SOURCES];

// Helper to check if text matches any fraud keywords
export function matchesKeywords(text: string, customKeywords?: string[]): boolean {
    const keywords = customKeywords || FRAUD_KEYWORDS;
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}
