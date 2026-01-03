
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
 * REFACTOR: Uses a "Grouping & Scavenging" strategy to preserve images.
 */
export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    // 1. Sort by relevance score desc initially to establish hierarchy
    const sortedInput = [...articles].sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
        return b.pubDate.getTime() - a.pubDate.getTime();
    });

    const groups: NewsArticle[][] = [];

    // 2. Grouping Phase
    for (const article of sortedInput) {
        let matched = false;

        for (const group of groups) {
            const representative = group[0]; // Compare against the group leader

            // A. Exact Image Match
            if (article.imageUrl && representative.imageUrl && article.imageUrl === representative.imageUrl) {
                group.push(article);
                matched = true;
                break;
            }

            // B. Title Similarity > 85% (Lowered slighty to catch "Breaking: ..." variations)
            if (getSimilarity(article.title.toLowerCase(), representative.title.toLowerCase()) > 0.85) {
                group.push(article);
                matched = true;
                break;
            }

            // C. Description Similarity > 80%
            const desc1 = article.description.slice(0, 200).toLowerCase();
            const desc2 = representative.description.slice(0, 200).toLowerCase();
            if (desc1.length > 30 && desc2.length > 30) {
                if (getSimilarity(desc1, desc2) > 0.80) {
                    group.push(article);
                    matched = true;
                    break;
                }
            }
        }

        if (!matched) {
            groups.push([article]);
        }
    }

    console.log(`[DEDUPE] Starting with ${sortedInput.length} articles. Groups created: ${groups.length}`);

    // 3. Merging & Scavenging Phase
    return groups.map(group => {
        // If single item, just return it
        if (group.length === 1) return { ...group[0], relatedStories: [] };

        // Find the "Primary" Article (Best Score + Newest)
        const primary = group.reduce((prev, current) => {
            if (current.relevanceScore > prev.relevanceScore) return current;
            if (current.relevanceScore === prev.relevanceScore) {
                return current.pubDate > prev.pubDate ? current : prev;
            }
            return prev;
        });

        // SCAVENGE ASSETS: Look through the whole group for the best image/video
        let bestImage = primary.imageUrl;
        let bestVideo = primary.videoUrl;

        // Helper to check if an image is "generic" or "bad"
        // Expanded to include common false-positives if possible
        const isGeneric = (url?: string) => !url || url.length < 10 || url.includes('placeholder') || url.includes('default') || url.includes('logo');
        const isSocial = (url?: string) => url && (url.includes('ytimg') || url.includes('twitter') || url.includes('twimg'));

        // AGGRESSIVE SCAVENGING:
        // 1. If we have a video service thumbnail in the group, ALWAYS prefer it (it's usually the most relevant visual).
        // 2. If the current bestImage is generic/missing, take ANY valid image.

        const socialDonor = group.find(a => isSocial(a.imageUrl));
        const anyDonor = group.find(a => !isGeneric(a.imageUrl));

        if (socialDonor && !isSocial(bestImage)) {
            bestImage = socialDonor.imageUrl;
            console.log(`[DEDUPE] Scavenged Social Image for "${primary.title.substring(0, 20)}..." from ${socialDonor.source}`);
        } else if (isGeneric(bestImage) && anyDonor) {
            bestImage = anyDonor.imageUrl;
            console.log(`[DEDUPE] Scavenged Fallback Image for "${primary.title.substring(0, 20)}..." from ${anyDonor.source}`);
        }

        if (!bestVideo) {
            const donor = group.find(a => !!a.videoUrl);
            if (donor) {
                bestVideo = donor.videoUrl;
                console.log(`[DEDUPE] Scavenged Video for "${primary.title.substring(0, 20)}..."`);
            }
        }

        // Construct the related stories list (excluding the primary itself)
        const related = group
            .filter(a => a.id !== primary.id)
            .filter((a, index, self) =>
                // Unique by source name to avoid 5 entries from "Twitter"
                index === self.findIndex(t => t.source === a.source)
            );

        return {
            ...primary,
            imageUrl: bestImage,
            videoUrl: bestVideo,
            relatedStories: related
        };
    });
}
