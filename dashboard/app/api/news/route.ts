/**
 * News API Route
 * Fetches and returns filtered news articles
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchNewsAPI } from "@/lib/news-api";

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutes

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        // Use Newscatcher API (with filters)
        const allArticles = await fetchNewsAPI();

        // Filter by type if requested (e.g., 'social' or 'news')
        const typeFilter = searchParams.get('type');
        let articles = allArticles;

        if (typeFilter) {
            articles = articles.filter(a => a.type === typeFilter);
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
