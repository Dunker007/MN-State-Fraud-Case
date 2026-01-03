
/**
 * News Scraper - Fetches and parses RSS feeds
 * Matches articles against fraud keywords
 */

import { matchesKeywords, type NewsSource } from './news-sources';
import { KEYWORD_MATRIX_PLAIN, FRAUD_SCORING_KEYWORDS, EXCLUDE_KEYWORDS } from './keyword-matrix';

export function buildFraudQuery(): string {
    const groups = Object.values(fraudKeywords).map(group =>
        `(${group.join(' OR ')})`
    );
    return groups.join(' AND ');
}

// Re-export for backwards compatibility
export const fraudKeywords = KEYWORD_MATRIX_PLAIN;

export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    link: string;
    pubDate: Date;
    source: string;
    sourceId: string;
    author?: string;
    imageUrl?: string;
    matchedKeywords: string[];
    relevanceScore: number;
    type?: 'news' | 'social';
    videoUrl?: string;
    relatedStories?: NewsArticle[];
}

interface RSSItem {
    title?: string;
    description?: string;
    link?: string;
    pubDate?: string;
    author?: string;
    'media:content'?: { $?: { url?: string } };
    enclosure?: { $?: { url?: string } };
}

/**
 * Parse RSS XML to extract items
 * Using regex-based parsing to avoid external dependencies
 */
function parseRSSItems(xml: string): RSSItem[] {
    const items: RSSItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];

        const getTagContent = (tag: string): string | undefined => {
            const tagRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
            const tagMatch = itemXml.match(tagRegex);
            if (tagMatch) {
                return (tagMatch[1] || tagMatch[2] || '').trim();
            }
            return undefined;
        };

        const getAttrUrl = (): string | undefined => {
            const mediaMatch = itemXml.match(/<media:content[^>]*url=([^"'\s]+)/i);
            const enclosureMatch = itemXml.match(/<enclosure[^>]*url=([^"'\s]+)/i);
            return (mediaMatch?.[1] || enclosureMatch?.[1])?.replace(/["']/g, '');
        };

        items.push({
            title: getTagContent('title'),
            description: getTagContent('description'),
            link: getTagContent('link'),
            pubDate: getTagContent('pubDate'),
            author: getTagContent('author') || getTagContent('dc:creator'),
            'media:content': { $: { url: getAttrUrl() } },
        });
    }

    return items;
}

/**
 * Calculate relevance score based on keyword matches
 */
export function calculateRelevance(title: string, description: string): { score: number; matched: string[]; shouldExclude: boolean } {
    const text = `${title} ${description}`.toLowerCase();
    const matched: string[] = [];

    // Check for exclusions first (sports, entertainment, etc.)
    const shouldExclude = EXCLUDE_KEYWORDS.some(keyword => text.includes(keyword));

    if (shouldExclude) {
        return { score: 0, matched: [], shouldExclude: true };
    }

    let score = 0;
    for (const { term, weight } of FRAUD_SCORING_KEYWORDS) {
        if (text.includes(term.toLowerCase())) {
            score += weight;
            matched.push(term);
        }
    }

    return { score, matched, shouldExclude: false };
}

/**
 * Fetch and parse a single RSS feed
 */
export async function fetchRSSFeed(source: NewsSource): Promise<NewsArticle[]> {
    try {
        const response = await fetch(source.url, {
            headers: {
                'User-Agent': 'Project Glass House Intel Feed/1.0',
            },
            next: { revalidate: 900 }, // Cache for 15 minutes
        });

        if (!response.ok) {
            console.error(`Failed to fetch ${source.name}: ${response.status}`);
            return [];
        }

        const xml = await response.text();
        const items = parseRSSItems(xml);

        const articles: NewsArticle[] = [];

        for (const item of items) {
            if (!item.title || !item.link) continue;

            const title = item.title;
            const description = item.description || '';
            const { score, matched, shouldExclude } = calculateRelevance(title, description);

            // Skip sports/entertainment articles
            if (shouldExclude) {
                continue;
            }

            // Apply source-specific keyword filter
            if (source.keywords && !matchesKeywords(`${title} ${description}`, source.keywords)) {
                continue;
            }

            // Generate unique ID using source + timestamp + url hash
            const urlHash = item.link.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
            const uniqueId = `${source.id}-${Math.abs(urlHash)}-${Date.parse(item.pubDate || '') || 0}`;

            articles.push({
                id: uniqueId,
                title,
                description: description.replace(/<[^>]*>/g, '').slice(0, 300),
                link: item.link,
                pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                source: source.name,
                sourceId: source.id,
                author: item.author,
                imageUrl: item['media:content']?.$?.url,
                matchedKeywords: matched,
                relevanceScore: score,
            });
        }

        return articles;
    } catch (error) {
        console.error(`Error fetching ${source.name}:`, error);
        return [];
    }
}

import { fetchNewsAPI } from './news-api';

/**
 * Fetch all news - Switched to pure Newscatcher V3 Feed (RSS Disabled)
 */
export async function fetchAllNews(): Promise<NewsArticle[]> {
    // RSS Feeds disabled - Newscatcher provides superior coverage/filtering
    // const rssArticles = await Promise.all(NEWS_SOURCES.map(source => fetchRSSFeed(source)));

    // Fetch only from Newscatcher V3
    const apiArticles = await fetchNewsAPI();

    return apiArticles; // was: [...rssArticles.flat(), ...apiArticles];
}

/**
 * Get only high-relevance articles
 */
export async function fetchRelevantNews(minScore: number = 5): Promise<NewsArticle[]> {
    const all = await fetchAllNews();
    return all.filter(article => article.relevanceScore >= minScore);
}
