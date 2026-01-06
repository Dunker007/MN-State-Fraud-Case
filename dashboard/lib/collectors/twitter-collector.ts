import { BaseCollector, CollectorResult, sleep, SCRAPE_DELAY_MS } from './base-collector';
import { addArticle } from '@/lib/database';

// Social Media Monitor
// Tracks Twitter/X mentions via Nitter (free Twitter frontend) or RSS feeds

export class TwitterCollector extends BaseCollector {
    name = 'TWITTER_COLLECTOR';
    source = 'https://nitter.net/';

    private accounts = ['maborins', 'MN_DEED', 'GovTimWalz', 'MNHouse', 'MNSenate'];
    private keywords = ['minnesota paid leave', 'MN PFML', 'DEED paid leave'];

    async collect(): Promise<CollectorResult> {
        try {
            let totalCollected = 0;

            for (const username of this.accounts) {
                const rssUrl = `https://nitter.net/${username}/rss`;

                try {
                    const response = await fetch(rssUrl, {
                        headers: { 'User-Agent': 'ProjectCrosscheck/1.0' }
                    });

                    if (response.ok) {
                        const xml = await response.text();

                        const itemPattern = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/gi;
                        const matches = xml.matchAll(itemPattern);

                        for (const match of matches) {
                            const title = match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
                            const url = match[2].trim();
                            const pubDate = match[3].trim();

                            const isRelevant = this.keywords.some(kw =>
                                title.toLowerCase().includes(kw.toLowerCase())
                            );

                            if (isRelevant) {
                                addArticle({
                                    url,
                                    title,
                                    source: `Twitter/@${username}`,
                                    published_date: new Date(pubDate).toISOString(),
                                    sentiment: 'neutral'
                                });
                                totalCollected++;
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`[${this.name}] Failed to fetch ${username}`);
                }

                await sleep(SCRAPE_DELAY_MS);
            }

            return { success: true, itemsCollected: totalCollected };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, itemsCollected: 0, error: errorMsg };
        }
    }
}

export const twitterCollector = new TwitterCollector();
