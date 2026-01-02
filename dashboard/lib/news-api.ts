/**
 * News API Client - Fetches news from NewsAPI
 * Filters articles against fraud keywords
 */

import { FRAUD_KEYWORDS, matchesKeywords } from './news-sources';
import { NewsArticle, calculateRelevance, buildFraudQuery } from './news-scraper';

interface NewsAPIResponse {
    status: string;
    totalResults: number;
    articles: NewsAPIArticle[];
}

interface NewsAPIArticle {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

/**
 * Fetch news from NewsAPI
 */
export async function fetchNewsAPI(): Promise<NewsArticle[]> {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        console.error('NEWS_API_KEY not set');
        return [];
    }

    const query = buildFraudQuery();
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${apiKey}&pageSize=100`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Project Glass House Intel Feed/1.0',
            },
            next: { revalidate: 900 }, // Cache for 15 minutes
        });

        if (!response.ok) {
            console.error(`Failed to fetch from NewsAPI: ${response.status}`);
            return [];
        }

        const data: NewsAPIResponse = await response.json();

        if (data.status !== 'ok') {
            console.error('NewsAPI response not ok');
            return [];
        }

        const articles: NewsArticle[] = [];

        for (const item of data.articles) {
            if (!item.title || !item.url) continue;

            const title = item.title;
            const description = item.description || '';
            const { score, matched, shouldExclude } = calculateRelevance(title, description);

            // Skip if excluded or low relevance
            if (shouldExclude || score < 1) {
                continue;
            }

            // Additional keyword filter
            if (!matchesKeywords(`${title} ${description}`, FRAUD_KEYWORDS)) {
                continue;
            }

            // Generate unique ID
            const urlHash = item.url.split('').reduce((a: number, b: string) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
            const uniqueId = `newsapi-${Math.abs(urlHash)}-${new Date(item.publishedAt).getTime()}`;

            articles.push({
                id: uniqueId,
                title,
                description: description.slice(0, 300),
                link: item.url,
                pubDate: new Date(item.publishedAt),
                source: item.source.name,
                sourceId: 'newsapi',
                author: item.author || undefined,
                imageUrl: item.urlToImage || undefined,
                matchedKeywords: matched,
                relevanceScore: score,
            });
        }

        return articles;
    } catch (error) {
        console.error('Error fetching from NewsAPI:', error);
        return [];
    }
}