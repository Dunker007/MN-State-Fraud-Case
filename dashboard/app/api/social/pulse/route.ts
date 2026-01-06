import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SocialMention {
    id: string;
    platform: 'reddit' | 'twitter' | 'news';
    sentiment: 'positive' | 'negative' | 'neutral';
    text: string;
    author?: string;
    timestamp: string;
    url?: string;
    score?: number;
}

// Sentiment keywords
const POSITIVE_WORDS = ['approved', 'success', 'great', 'love', 'helpful', 'working', 'benefit', 'received', 'quick', 'easy'];
const NEGATIVE_WORDS = ['fraud', 'scam', 'fail', 'crash', 'slow', 'deny', 'denied', 'broken', 'waste', 'waiting', 'problem', 'issue', 'frustrated'];

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lower = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    POSITIVE_WORDS.forEach(word => {
        if (lower.includes(word)) positiveScore++;
    });
    NEGATIVE_WORDS.forEach(word => {
        if (lower.includes(word)) negativeScore++;
    });

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
}

async function fetchRedditMentions(): Promise<SocialMention[]> {
    const mentions: SocialMention[] = [];
    const subreddits = ['minnesota', 'twincities', 'Minneapolis', 'stpaul'];
    const keywords = ['paid leave', 'DEED', 'varilek', 'paid family leave', 'minnesota leave'];

    for (const subreddit of subreddits) {
        try {
            console.log(`[SOCIAL] Fetching r/${subreddit}`);

            // Reddit's public JSON API (no auth required for read)
            const response = await fetch(`https://www.reddit.com/r/${subreddit}/new.json?limit=25`, {
                headers: {
                    'User-Agent': 'ProjectCrosscheck/1.0'
                },
                next: { revalidate: 0 }
            });

            if (!response.ok) {
                console.log(`[SOCIAL] Reddit r/${subreddit} returned ${response.status}`);
                continue;
            }

            const data = await response.json();
            const posts = data?.data?.children || [];

            for (const post of posts) {
                const title = post.data?.title || '';
                const selftext = post.data?.selftext || '';
                const fullText = `${title} ${selftext}`.toLowerCase();

                // Check if post mentions paid leave
                const isRelevant = keywords.some(kw => fullText.includes(kw.toLowerCase()));

                if (isRelevant) {
                    const created = post.data?.created_utc;
                    const timestamp = created ? new Date(created * 1000).toISOString() : new Date().toISOString();

                    mentions.push({
                        id: post.data?.id || String(Math.random()),
                        platform: 'reddit',
                        sentiment: analyzeSentiment(fullText),
                        text: title.substring(0, 200),
                        author: post.data?.author,
                        timestamp,
                        url: `https://reddit.com${post.data?.permalink}`,
                        score: post.data?.score
                    });
                }
            }
        } catch (error) {
            console.error(`[SOCIAL] Error fetching r/${subreddit}:`, error);
        }
    }

    return mentions;
}

// Also search for news mentions via GDELT (if time permits)
async function fetchNewsMentions(): Promise<SocialMention[]> {
    const mentions: SocialMention[] = [];

    try {
        // Use existing news API
        const response = await fetch('http://localhost:3000/api/news', {
            next: { revalidate: 0 }
        });

        if (response.ok) {
            const articles = await response.json();
            const paidLeaveArticles = articles.filter((a: { title?: string; description?: string }) => {
                const text = `${a.title || ''} ${a.description || ''}`.toLowerCase();
                return text.includes('paid leave') || text.includes('deed') || text.includes('varilek');
            }).slice(0, 5);

            for (const article of paidLeaveArticles) {
                mentions.push({
                    id: article.url || String(Math.random()),
                    platform: 'news',
                    sentiment: analyzeSentiment(`${article.title} ${article.description}`),
                    text: article.title?.substring(0, 200) || '',
                    timestamp: article.publishedAt || new Date().toISOString(),
                    url: article.url
                });
            }
        }
    } catch (error) {
        console.log('[SOCIAL] News fetch skipped:', error);
    }

    return mentions;
}

export async function GET() {
    console.log('[SOCIAL] Fetching social mentions');

    const [redditMentions, newsMentions] = await Promise.all([
        fetchRedditMentions(),
        fetchNewsMentions()
    ]);

    const allMentions = [...redditMentions, ...newsMentions];

    // Sort by timestamp descending
    allMentions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate sentiment breakdown
    const positive = allMentions.filter(m => m.sentiment === 'positive').length;
    const negative = allMentions.filter(m => m.sentiment === 'negative').length;
    const neutral = allMentions.filter(m => m.sentiment === 'neutral').length;
    const total = allMentions.length;

    // Sentiment score (0-100, 50 is neutral)
    const sentimentScore = total > 0
        ? Math.round(50 + ((positive - negative) / total) * 50)
        : 50;

    return NextResponse.json({
        success: true,
        mentions: allMentions.slice(0, 20), // Limit to 20 most recent
        stats: {
            total,
            positive,
            negative,
            neutral,
            sentimentScore
        },
        timestamp: new Date().toISOString()
    });
}
