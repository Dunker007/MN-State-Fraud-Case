/**
 * News API Route
 * Fetches and returns filtered news articles
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews, fetchRelevantNews } from "@/lib/news-scraper";

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutes

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const minScore = parseInt(searchParams.get('minScore') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        let articles;

        if (minScore > 0) {
            articles = await fetchRelevantNews(minScore);
        } else {
            articles = await fetchAllNews();
        }

        // Limit results
        const limited = articles.slice(0, limit);

        return NextResponse.json({
            success: true,
            count: limited.length,
            totalAvailable: articles.length,
            articles: limited,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error) {
        console.error('News API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch news' },
            { status: 500 }
        );
    }
}
