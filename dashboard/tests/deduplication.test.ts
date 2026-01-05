/**
 * Deduplication Tests
 * Tests the news article deduplication logic
 */

import { describe, it, expect } from 'vitest';
import { deduplicateArticles } from '@/lib/deduplication';

// Create a full NewsArticle for testing
const createArticle = (
    id: string,
    title: string,
    url: string,
    relevanceScore: number = 50
) => ({
    id,
    title,
    link: url,
    source: 'Test Source',
    sourceId: 'test-source',
    pubDate: new Date(),
    description: 'Test description for the article that gives context.',
    relevanceScore,
    matchedKeywords: ['test'],
    type: 'news' as const,
});

describe('deduplicateArticles', () => {
    it('returns empty array for empty input', () => {
        const result = deduplicateArticles([]);
        expect(result).toEqual([]);
    });

    it('returns single article unchanged', () => {
        const articles = [createArticle('1', 'Unique Article', 'https://example.com/a')];
        const result = deduplicateArticles(articles);
        expect(result.length).toBe(1);
        expect(result[0].title).toBe('Unique Article');
    });

    it('groups articles with very similar titles', () => {
        const articles = [
            createArticle('1', 'Minnesota Fraud Case Update January 2026', 'https://site1.com/a', 80),
            createArticle('2', 'Minnesota Fraud Case Update January 2026', 'https://site2.com/b', 60),
        ];

        const result = deduplicateArticles(articles);
        expect(result.length).toBe(1);
        // The primary should have the higher relevance score
        expect(result[0].relevanceScore).toBe(80);
    });

    it('keeps distinct articles separate', () => {
        const articles = [
            {
                ...createArticle('1', 'Apple launches new iPhone model today', 'https://site1.com/a'),
                description: 'Technology company Apple unveiled its latest smartphone with innovative features.',
            },
            {
                ...createArticle('2', 'Local sports team wins championship game', 'https://site2.com/b'),
                description: 'The hometown basketball team secured victory in an exciting final match.',
            },
        ];

        const result = deduplicateArticles(articles);
        expect(result.length).toBe(2);
    });

    it('adds relatedStories to grouped articles', () => {
        const articles = [
            createArticle('1', 'Breaking News: Major Fraud Discovery', 'https://site1.com/a', 90),
            createArticle('2', 'Breaking News: Major Fraud Discovery Today', 'https://site2.com/b', 70),
            createArticle('3', 'Breaking News: Major Fraud Discovery Report', 'https://site3.com/c', 50),
        ];

        const result = deduplicateArticles(articles);
        expect(result.length).toBe(1);
        expect(result[0].relatedStories).toBeDefined();
        if (result[0].relatedStories) {
            expect(result[0].relatedStories.length).toBeGreaterThan(0);
        }
    });

    it('scavenges images from group members', () => {
        const articles = [
            { ...createArticle('1', 'Same Story', 'https://site1.com/a', 90), imageUrl: undefined },
            { ...createArticle('2', 'Same Story', 'https://site2.com/b', 70), imageUrl: 'https://example.com/good-image.jpg' },
        ];

        const result = deduplicateArticles(articles);
        expect(result.length).toBe(1);
        expect(result[0].imageUrl).toBe('https://example.com/good-image.jpg');
    });
});
