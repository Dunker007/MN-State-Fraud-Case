/**
 * News API Tests
 * Tests the GDELT news fetching and article processing
 */

import { describe, it, expect } from 'vitest';
import { fetchNewsAPI } from '@/lib/news-api';

describe('fetchNewsAPI', () => {
    it('is a function', () => {
        expect(typeof fetchNewsAPI).toBe('function');
    });

    it('returns an array of articles', async () => {
        // This test may hit the real API or return mock data
        // depending on the implementation
        const articles = await fetchNewsAPI();
        expect(Array.isArray(articles)).toBe(true);
    }, 10000);

    it('articles have required fields', async () => {
        const articles = await fetchNewsAPI();
        if (articles.length > 0) {
            const article = articles[0];
            expect(article.title).toBeDefined();
            expect(article.link).toBeDefined();
            expect(article.relevanceScore).toBeDefined();
            expect(typeof article.relevanceScore).toBe('number');
        }
    }, 10000);

    it('accepts custom query parameter', async () => {
        // Should not throw
        const articles = await fetchNewsAPI('Minnesota fraud');
        expect(Array.isArray(articles)).toBe(true);
    }, 10000);
});
