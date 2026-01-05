/**
 * News Correlation API
 * Fetches news headlines from around dates of DHS site incidents
 * to identify suspicious timing patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'data', 'dhs-monitor', 'excuse-log.json');

interface Incident {
    timestamp: string;
    date: string;
    excuse_type?: string;
    excuse_text?: string;
}

interface NewsArticle {
    title: string;
    source: string;
    url?: string;
    date: string;
    snippet?: string;
}

interface CorrelationResult {
    incident_date: string;
    excuse_type: string;
    excuse_text?: string;
    news_articles: NewsArticle[];
    correlation_score: number; // 0-100 based on keyword matches
}

// Keywords that suggest fraud/DHS-related news
const CORRELATION_KEYWORDS = [
    'DHS', 'Department of Human Services', 'Minnesota',
    'fraud', 'investigation', 'audit', 'scandal',
    'Feeding Our Future', 'childcare', 'daycare',
    'provider', 'license', 'revoked', 'suspended',
    'oversight', 'accountability', 'negligence',
    'inspector general', 'OLA', 'legislative auditor',
    'Walz', 'Harpstead', 'commissioner',
    'arrest', 'indictment', 'charged', 'convicted'
];

async function searchGDELT(query: string, date: string): Promise<NewsArticle[]> {
    // GDELT DOC 2.0 API - free news search
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 2);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 2);

    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=10&format=json&startdatetime=${formatGDELTDate(startDate)}&enddatetime=${formatGDELTDate(endDate)}`;

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'CrosscheckBot/1.0' },
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) return [];

        const data = await response.json();

        if (!data.articles) return [];

        return data.articles.map((a: { title?: string; source?: string; domain?: string; url?: string; seendate?: string }) => ({
            title: a.title || 'Untitled',
            source: a.source || a.domain || 'Unknown',
            url: a.url,
            date: a.seendate ? formatDate(a.seendate) : date
        }));
    } catch {
        return [];
    }
}

function formatGDELTDate(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '') + '000000';
}

function formatDate(gdeltDate: string): string {
    // Convert YYYYMMDDHHMMSS to YYYY-MM-DD
    if (gdeltDate.length >= 8) {
        return `${gdeltDate.slice(0, 4)}-${gdeltDate.slice(4, 6)}-${gdeltDate.slice(6, 8)}`;
    }
    return gdeltDate;
}

function calculateCorrelationScore(articles: NewsArticle[]): number {
    if (articles.length === 0) return 0;

    let score = 0;
    const allText = articles.map(a => `${a.title} ${a.snippet || ''}`).join(' ').toLowerCase();

    for (const keyword of CORRELATION_KEYWORDS) {
        if (allText.includes(keyword.toLowerCase())) {
            score += 5;
        }
    }

    // Bonus for multiple articles
    score += Math.min(articles.length * 2, 20);

    return Math.min(score, 100);
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'check';

    try {
        // Load incident log
        let incidents: Incident[] = [];
        try {
            const data = await readFile(LOG_FILE, 'utf-8');
            const log = JSON.parse(data);
            incidents = log.incidents || [];
        } catch {
            // No incidents yet
        }

        // Filter to only degraded/down incidents
        const issueIncidents = incidents.filter(i =>
            i.excuse_type && i.excuse_type !== 'up'
        );

        // ACTION: Check correlation for a specific date
        if (action === 'check') {
            const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

            // Search for DHS/fraud-related news around this date
            const queries = [
                'Minnesota DHS fraud',
                'Minnesota Department Human Services',
                'Feeding Our Future',
                'Minnesota childcare fraud'
            ];

            const allArticles: NewsArticle[] = [];

            for (const query of queries) {
                const articles = await searchGDELT(query, date);
                allArticles.push(...articles);
                await new Promise(r => setTimeout(r, 200)); // Rate limit
            }

            // Dedupe by title
            const seen = new Set<string>();
            const uniqueArticles = allArticles.filter(a => {
                if (seen.has(a.title)) return false;
                seen.add(a.title);
                return true;
            });

            const score = calculateCorrelationScore(uniqueArticles);

            return NextResponse.json({
                success: true,
                date,
                articles_found: uniqueArticles.length,
                correlation_score: score,
                articles: uniqueArticles,
                interpretation: score > 50
                    ? '🚨 HIGH correlation with negative press'
                    : score > 20
                        ? '⚠️ MODERATE correlation with news'
                        : '📊 Low correlation'
            });
        }

        // ACTION: Analyze all incidents for news correlation
        if (action === 'analyze') {
            const results: CorrelationResult[] = [];

            // Analyze up to 10 most recent incidents
            const toAnalyze = issueIncidents.slice(-10).reverse();

            for (const incident of toAnalyze) {
                const articles = await searchGDELT('Minnesota DHS', incident.date);

                results.push({
                    incident_date: incident.date,
                    excuse_type: incident.excuse_type || 'UNKNOWN',
                    excuse_text: incident.excuse_text,
                    news_articles: articles.slice(0, 5),
                    correlation_score: calculateCorrelationScore(articles)
                });

                await new Promise(r => setTimeout(r, 500)); // Rate limit
            }

            // Sort by correlation score
            results.sort((a, b) => b.correlation_score - a.correlation_score);

            const highCorrelation = results.filter(r => r.correlation_score > 50);
            const avgScore = results.length > 0
                ? Math.round(results.reduce((sum, r) => sum + r.correlation_score, 0) / results.length)
                : 0;

            return NextResponse.json({
                success: true,
                total_incidents_analyzed: results.length,
                high_correlation_count: highCorrelation.length,
                average_correlation_score: avgScore,
                results,
                summary: highCorrelation.length > 0
                    ? `🚨 Found ${highCorrelation.length} incidents that correlate with negative press coverage`
                    : avgScore > 20
                        ? '⚠️ Some correlation detected between incidents and news coverage'
                        : '📊 No strong correlation pattern detected (yet)'
            });
        }

        // ACTION: Get summary stats
        if (action === 'summary') {
            return NextResponse.json({
                success: true,
                total_incidents: issueIncidents.length,
                unique_dates: [...new Set(issueIncidents.map(i => i.date))].length,
                excuse_types: [...new Set(issueIncidents.map(i => i.excuse_type))],
                date_range: {
                    first: issueIncidents[0]?.date || null,
                    last: issueIncidents[issueIncidents.length - 1]?.date || null
                },
                endpoints: {
                    check_date: '/api/news-correlation?action=check&date=2024-06-15',
                    analyze_all: '/api/news-correlation?action=analyze',
                    summary: '/api/news-correlation?action=summary'
                }
            });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({
            error: 'Correlation check failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
