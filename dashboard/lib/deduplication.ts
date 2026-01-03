
import { NewsArticle } from './news-scraper';

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshtein(a: string, b: string): number {
    const matrix = [];
    let i, j;

    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Calculates similarity percentage (0-1)
 */
function getSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    if (longer.length === 0) return 1.0;
    const distance = levenshtein(s1, s2);
    return (longer.length - distance) / longer.length;
}

/**
 * Deduplicate articles based on Image URL, Title, and Description
 */
export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const uniqueArticles: NewsArticle[] = [];

    // Sort by relevance score (descending) and then by date (newest first)
    // This ensures we prioritize the "best" version of the story as the primary
    const sortedArticles = [...articles].sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
        }
        return b.pubDate.getTime() - a.pubDate.getTime();
    });

    for (const article of sortedArticles) {
        let isDuplicate = false;

        for (const unique of uniqueArticles) {
            // 1. Check Image URL (Live Visual Dedupe)
            // Ignore generic placeholders if any, but assuming mostly valid URLs
            if (article.imageUrl && unique.imageUrl && article.imageUrl === unique.imageUrl) {
                isDuplicate = true;
                addRelatedStory(unique, article);
                break;
            }

            // 2. Check Title Similarity > 90%
            if (getSimilarity(article.title.toLowerCase(), unique.title.toLowerCase()) > 0.9) {
                isDuplicate = true;
                addRelatedStory(unique, article);
                break;
            }

            // 3. Check Description Similarity > 85% (First 200 chars)
            // Only checks if both have decent descriptions
            const desc1 = article.description.slice(0, 200).toLowerCase();
            const desc2 = unique.description.slice(0, 200).toLowerCase();
            if (desc1.length > 50 && desc2.length > 50) {
                if (getSimilarity(desc1, desc2) > 0.85) {
                    isDuplicate = true;
                    addRelatedStory(unique, article);
                    break;
                }
            }
        }

        if (!isDuplicate) {
            uniqueArticles.push({ ...article, relatedStories: [] });
        }
    }

    return uniqueArticles;
}

function addRelatedStory(primary: NewsArticle, duplicate: NewsArticle) {
    if (!primary.relatedStories) {
        primary.relatedStories = [];
    }

    // INHERITANCE LOGIC:
    // If the primary article is missing assets that the duplicate has, steal them.
    // This fixes the "Double Block" where a high-ranking text-only source hides a lower-ranking rich-media source.

    // 1. Inherit Image
    if (!primary.imageUrl && duplicate.imageUrl) {
        primary.imageUrl = duplicate.imageUrl;
    }

    // 2. Inherit Video
    if (!primary.videoUrl && duplicate.videoUrl) {
        primary.videoUrl = duplicate.videoUrl;
    }

    // Avoid re-adding same source if possible, or just push
    // We want to track unique sources
    const exists = primary.relatedStories.some(s => s.source === duplicate.source);
    if (!exists && primary.source !== duplicate.source) {
        primary.relatedStories.push(duplicate);
    }
}
