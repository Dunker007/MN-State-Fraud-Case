'use server';

import { fetchNewsAPI } from '@/lib/news-api';

export async function getFreshIntelAction(query?: string) {
    try {
        const articles = await fetchNewsAPI(query);
        return { success: true, articles };
    } catch (error) {
        console.error('Failed to fetch fresh intel:', error);
        return { success: false, articles: [] };
    }
}
