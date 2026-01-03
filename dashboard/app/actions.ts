'use server';

import { fetchNewsAPI } from '@/lib/news-api';

export async function getFreshIntelAction() {
    try {
        const articles = await fetchNewsAPI();
        return { success: true, articles };
    } catch (error) {
        console.error('Failed to fetch fresh intel:', error);
        return { success: false, articles: [] };
    }
}
