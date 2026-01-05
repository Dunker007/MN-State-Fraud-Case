/**
 * DHS Site Monitor - "Excuse Tracker"
 * 
 * Daily monitoring of MN DHS License Lookup site to document:
 * - Error messages and maintenance excuses
 * - Screenshots of broken states
 * - Timestamps and patterns
 * - Correlation with news events
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DHS_URL = 'https://licensinglookup.dhs.state.mn.us/';
const DATA_DIR = path.join(process.cwd(), 'data', 'dhs-monitor');
const LOG_FILE = path.join(DATA_DIR, 'excuse-log.json');

interface SiteCheckResult {
    timestamp: string;
    date: string;
    time: string;
    status: 'up' | 'down' | 'degraded' | 'blocked';
    http_status?: number;
    excuse_type?: string;
    excuse_text?: string;
    response_time_ms?: number;
    screenshot_path?: string;
    raw_response_sample?: string;
    news_correlation?: NewsCorrelation[];
}

interface NewsCorrelation {
    headline: string;
    source: string;
    url?: string;
    published_date?: string;
}

interface ExcuseLog {
    last_check: string;
    total_checks: number;
    incidents: SiteCheckResult[];
    excuse_frequency: Record<string, number>;
    downtime_by_day: Record<string, number>;
}

// Known DHS excuse patterns - Documented bureaucratic deflections
const EXCUSE_PATTERNS = [
    // Security/Bot blocks
    { pattern: /apologize for the inconvenience/i, type: 'CAPTCHA_BLOCK' },
    { pattern: /activity and behavior.*made us think.*bot/i, type: 'BOT_DETECTION' },
    { pattern: /malicious behavior/i, type: 'MALICIOUS_CLAIM' },
    { pattern: /CAPTCHA/i, type: 'CAPTCHA_CHALLENGE' },
    { pattern: /Radware/i, type: 'RADWARE_SECURITY' },
    { pattern: /access denied/i, type: 'ACCESS_DENIED' },
    { pattern: /rate limit/i, type: 'RATE_LIMITED' },

    // "Systems Issues" - The classic bureaucratic deflection
    { pattern: /systems? issue/i, type: 'SYSTEMS_ISSUE' },
    { pattern: /preventing.*documents? from posting/i, type: 'DOCUMENTS_NOT_POSTING' },
    { pattern: /working with MNIT/i, type: 'MNIT_BLAME' },
    { pattern: /hard copies.*being mailed/i, type: 'PAPER_FALLBACK' },
    { pattern: /this message will be removed/i, type: 'TEMPORARY_NOTICE' },

    // General maintenance/errors
    { pattern: /maintenance/i, type: 'MAINTENANCE' },
    { pattern: /temporarily unavailable/i, type: 'TEMP_UNAVAILABLE' },
    { pattern: /error occurred/i, type: 'GENERIC_ERROR' },
    { pattern: /please try again later/i, type: 'TRY_LATER' },
    { pattern: /service unavailable/i, type: 'SERVICE_UNAVAILABLE' },
    { pattern: /experiencing.*difficulties/i, type: 'TECHNICAL_DIFFICULTIES' },
    { pattern: /scheduled.*downtime/i, type: 'SCHEDULED_DOWNTIME' },

    // HTTP errors
    { pattern: /500|internal server error/i, type: 'SERVER_ERROR_500' },
    { pattern: /503|service temporarily/i, type: 'SERVICE_UNAVAILABLE_503' },
    { pattern: /404|not found/i, type: 'NOT_FOUND_404' },
    { pattern: /502|bad gateway/i, type: 'BAD_GATEWAY_502' },

    // Data/Content issues
    { pattern: /data.*unavailable/i, type: 'DATA_UNAVAILABLE' },
    { pattern: /records?.*not.*available/i, type: 'RECORDS_UNAVAILABLE' },
    { pattern: /information.*delayed/i, type: 'INFORMATION_DELAYED' },
    { pattern: /update.*in progress/i, type: 'UPDATE_IN_PROGRESS' },
];

async function ensureDataDir(): Promise<void> {
    if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
    }
}

async function loadLog(): Promise<ExcuseLog> {
    try {
        const data = await readFile(LOG_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return {
            last_check: '',
            total_checks: 0,
            incidents: [],
            excuse_frequency: {},
            downtime_by_day: {}
        };
    }
}

async function saveLog(log: ExcuseLog): Promise<void> {
    await ensureDataDir();
    await writeFile(LOG_FILE, JSON.stringify(log, null, 2));
}

// ==========================================
// WAYBACK MACHINE INTEGRATION
// ==========================================

interface WaybackSnapshot {
    timestamp: string;       // YYYYMMDDHHMMSS format
    original_url: string;
    status_code: string;
    archived_url: string;
    date_formatted: string;  // Human readable
}

interface WaybackAnalysis {
    timestamp: string;
    archived_url: string;
    date: string;
    status: 'up' | 'down' | 'degraded' | 'unknown';
    excuse_type?: string;
    excuse_text?: string;
    http_status?: string;
}

async function getWaybackSnapshots(
    startDate?: string,
    endDate?: string,
    limit: number = 100
): Promise<WaybackSnapshot[]> {
    const baseUrl = 'https://web.archive.org/cdx/search/cdx';
    const params = new URLSearchParams({
        url: 'licensinglookup.dhs.state.mn.us',
        output: 'json',
        limit: limit.toString(),
        filter: 'statuscode:200|503|500|403|302',
        ...(startDate && { from: startDate.replace(/-/g, '') }),
        ...(endDate && { to: endDate.replace(/-/g, '') })
    });

    try {
        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) return [];

        const data = await response.json();
        if (!Array.isArray(data) || data.length < 2) return [];

        // Skip header row
        return data.slice(1).map((row: string[]) => ({
            timestamp: row[1],
            original_url: row[2],
            status_code: row[4],
            archived_url: `https://web.archive.org/web/${row[1]}/${row[2]}`,
            date_formatted: formatWaybackDate(row[1])
        }));
    } catch {
        return [];
    }
}

function formatWaybackDate(timestamp: string): string {
    // Convert YYYYMMDDHHMMSS to YYYY-MM-DD HH:MM:SS
    if (timestamp.length < 14) return timestamp;
    return `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)} ` +
        `${timestamp.slice(8, 10)}:${timestamp.slice(10, 12)}:${timestamp.slice(12, 14)}`;
}

async function analyzeWaybackSnapshot(snapshot: WaybackSnapshot): Promise<WaybackAnalysis> {
    const analysis: WaybackAnalysis = {
        timestamp: snapshot.timestamp,
        archived_url: snapshot.archived_url,
        date: snapshot.date_formatted,
        status: 'unknown',
        http_status: snapshot.status_code
    };

    // Non-200 status codes indicate issues
    if (snapshot.status_code !== '200') {
        analysis.status = 'down';
        analysis.excuse_type = `HTTP_${snapshot.status_code}`;
        return analysis;
    }

    // Try to fetch and analyze the archived content
    try {
        const response = await fetch(snapshot.archived_url, {
            headers: { 'User-Agent': 'CrosscheckBot/1.0 (Historical Research)' }
        });

        if (response.ok) {
            const html = await response.text();

            if (isNormalSearchPage(html)) {
                analysis.status = 'up';
            } else {
                const excuse = detectExcuse(html);
                if (excuse) {
                    analysis.status = 'degraded';
                    analysis.excuse_type = excuse.type;
                    analysis.excuse_text = excuse.text;
                } else {
                    analysis.status = 'up'; // Assume OK if no excuse detected
                }
            }
        }
    } catch {
        // Can't analyze content, just use HTTP status
        analysis.status = snapshot.status_code === '200' ? 'up' : 'down';
    }

    return analysis;
}

async function getHistoricalIncidents(
    startDate?: string,
    endDate?: string,
    analyzeContent: boolean = false,
    maxAnalyze: number = 10
): Promise<{ snapshots: WaybackSnapshot[], analyzed?: WaybackAnalysis[], excusesFound?: WaybackAnalysis[] }> {
    const snapshots = await getWaybackSnapshots(startDate, endDate, 500);

    if (!analyzeContent) {
        return { snapshots };
    }

    // Analyze snapshots for content - look for excuses
    const analyzed: WaybackAnalysis[] = [];
    const excusesFound: WaybackAnalysis[] = [];

    // Prioritize analyzing more recent snapshots and spread across time
    const toAnalyze = snapshots.slice(-maxAnalyze).reverse();

    for (const snapshot of toAnalyze) {
        const analysis = await analyzeWaybackSnapshot(snapshot);
        analyzed.push(analysis);

        // Collect any excuses found
        if (analysis.excuse_type && analysis.status !== 'up') {
            excusesFound.push(analysis);
        }

        // Small delay to be respectful to Wayback Machine
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    return { snapshots, analyzed, excusesFound };
}

/**
 * Deep scan: Analyze ALL archived snapshots for a date range
 * Returns all historical excuses/banners found
 */
async function deepScanHistoricalExcuses(
    startDate?: string,
    endDate?: string
): Promise<WaybackAnalysis[]> {
    const snapshots = await getWaybackSnapshots(startDate, endDate, 1000);
    const excuses: WaybackAnalysis[] = [];

    console.log(`[DHS_MONITOR] Deep scanning ${snapshots.length} snapshots...`);

    // Sample every Nth snapshot to cover the time range efficiently
    const sampleRate = Math.max(1, Math.floor(snapshots.length / 50));
    const sampled = snapshots.filter((_, i) => i % sampleRate === 0);

    for (const snapshot of sampled) {
        try {
            const analysis = await analyzeWaybackSnapshot(snapshot);

            if (analysis.excuse_type) {
                excuses.push(analysis);
                console.log(`[DHS_MONITOR] Found excuse: ${analysis.excuse_type} on ${analysis.date}`);
            }

            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch {
            // Skip failed analyses
        }
    }

    return excuses;
}

function detectExcuse(html: string): { type: string; text: string } | null {
    // First check for known patterns
    for (const { pattern, type } of EXCUSE_PATTERNS) {
        const match = html.match(pattern);
        if (match) {
            // Extract surrounding context (up to 300 chars)
            const start = Math.max(0, match.index! - 50);
            const end = Math.min(html.length, match.index! + match[0].length + 250);
            const context = html.slice(start, end).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            return { type, text: context };
        }
    }

    // Look for common banner/notice container patterns and extract text
    const bannerPatterns = [
        // Common notice/alert container classes
        /<div[^>]*class="[^"]*(?:alert|notice|warning|banner|message|info-box|system-message)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        // Inline style banners (often yellow/red backgrounds)
        /<div[^>]*style="[^"]*(?:background[^"]*(?:yellow|red|orange)|color[^"]*(?:red|#ff))[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        // "DHS is aware" style notices
        /<[^>]*>([^<]*DHS is aware[^<]*)<\/[^>]*>/gi,
        // Messages about issues/problems
        /<[^>]*>([^<]*(?:aware of|experiencing|working to resolve|apologize)[^<]{10,200})<\/[^>]*>/gi,
        // Spans with alert styling
        /<span[^>]*class="[^"]*(?:alert|error|warning)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    ];

    for (const bannerPattern of bannerPatterns) {
        const match = bannerPattern.exec(html);
        if (match && match[1]) {
            // Clean HTML tags and normalize whitespace
            const bannerText = match[1]
                .replace(/<[^>]+>/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // Only return if there's substantial text (not just empty containers)
            if (bannerText.length > 20) {
                return {
                    type: 'BANNER_NOTICE',
                    text: bannerText.slice(0, 500) // Cap at 500 chars
                };
            }
        }
    }

    return null;
}

function isNormalSearchPage(html: string): boolean {
    // Check if it's the normal functioning search page
    return html.includes('Enter information in one or more fields') &&
        html.includes('licensed providers') &&
        !html.includes('apologize for the inconvenience') &&
        !html.includes('CAPTCHA');
}

async function checkSite(): Promise<SiteCheckResult> {
    const now = new Date();
    const result: SiteCheckResult = {
        timestamp: now.toISOString(),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        status: 'down'
    };

    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(DHS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            signal: controller.signal
        });

        clearTimeout(timeout);

        result.http_status = response.status;
        result.response_time_ms = Date.now() - startTime;

        const html = await response.text();
        result.raw_response_sample = html.slice(0, 500);

        if (response.ok && isNormalSearchPage(html)) {
            result.status = 'up';
        } else {
            const excuse = detectExcuse(html);
            if (excuse) {
                result.status = 'degraded';
                result.excuse_type = excuse.type;
                result.excuse_text = excuse.text;
            } else if (!response.ok) {
                result.status = 'down';
                result.excuse_type = `HTTP_${response.status}`;
            } else {
                result.status = 'degraded';
                result.excuse_type = 'UNKNOWN_DEGRADATION';
            }
        }

    } catch (error) {
        result.response_time_ms = Date.now() - startTime;

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                result.excuse_type = 'TIMEOUT';
                result.excuse_text = 'Request timed out after 30 seconds';
            } else {
                result.excuse_type = 'FETCH_ERROR';
                result.excuse_text = error.message;
            }
        }
    }

    return result;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'status';

    try {
        await ensureDataDir();

        // ACTION: Check site now
        if (action === 'check') {
            const result = await checkSite();
            const log = await loadLog();

            // Only log incidents (not normal 'up' status unless it's the first check of the day)
            const todayChecks = log.incidents.filter(i => i.date === result.date);
            const shouldLog = result.status !== 'up' || todayChecks.length === 0;

            if (shouldLog) {
                log.incidents.push(result);
                log.total_checks++;
                log.last_check = result.timestamp;

                // Update frequency counters
                if (result.excuse_type) {
                    log.excuse_frequency[result.excuse_type] =
                        (log.excuse_frequency[result.excuse_type] || 0) + 1;
                }

                if (result.status !== 'up') {
                    log.downtime_by_day[result.date] =
                        (log.downtime_by_day[result.date] || 0) + 1;
                }

                await saveLog(log);
            }

            return NextResponse.json({
                success: true,
                check: result,
                logged: shouldLog,
                message: result.status === 'up'
                    ? 'Site is functioning normally'
                    : `Site issue detected: ${result.excuse_type}`
            });
        }

        // ACTION: Get full log
        if (action === 'log') {
            const log = await loadLog();

            // Add statistics
            const stats = {
                total_incidents: log.incidents.filter(i => i.status !== 'up').length,
                total_checks: log.total_checks,
                uptime_percentage: log.total_checks > 0
                    ? ((log.total_checks - log.incidents.filter(i => i.status !== 'up').length) / log.total_checks * 100).toFixed(1)
                    : '100',
                most_common_excuse: Object.entries(log.excuse_frequency)
                    .sort((a, b) => b[1] - a[1])[0] || ['None', 0],
                worst_days: Object.entries(log.downtime_by_day)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
            };

            return NextResponse.json({
                success: true,
                log,
                stats,
                message: `${log.incidents.length} incidents logged`
            });
        }

        // ACTION: Get recent incidents only
        if (action === 'recent') {
            const log = await loadLog();
            const recentIncidents = log.incidents
                .filter(i => i.status !== 'up')
                .slice(-20)
                .reverse();

            return NextResponse.json({
                success: true,
                incidents: recentIncidents,
                total_incidents: log.incidents.filter(i => i.status !== 'up').length
            });
        }

        // ACTION: Status overview
        if (action === 'status') {
            const log = await loadLog();
            const last24h = log.incidents.filter(i => {
                const checkTime = new Date(i.timestamp);
                const now = new Date();
                return (now.getTime() - checkTime.getTime()) < 24 * 60 * 60 * 1000;
            });

            const issues24h = last24h.filter(i => i.status !== 'up');

            return NextResponse.json({
                success: true,
                current_status: log.incidents.length > 0
                    ? log.incidents[log.incidents.length - 1].status
                    : 'unknown',
                last_check: log.last_check || 'Never',
                issues_last_24h: issues24h.length,
                total_incidents: log.incidents.filter(i => i.status !== 'up').length,
                excuse_frequency: log.excuse_frequency,
                api_endpoints: {
                    check: '/api/dhs-monitor?action=check',
                    log: '/api/dhs-monitor?action=log',
                    recent: '/api/dhs-monitor?action=recent',
                    status: '/api/dhs-monitor?action=status'
                }
            });
        }

        // ACTION: Get historical snapshots from Wayback Machine
        if (action === 'historical' || action === 'wayback') {
            const startDate = searchParams.get('from') || undefined;
            const endDate = searchParams.get('to') || undefined;
            const analyze = searchParams.get('analyze') === 'true';

            const { snapshots, analyzed } = await getHistoricalIncidents(startDate, endDate, analyze);

            // Group snapshots by year for summary
            const byYear: Record<string, number> = {};
            for (const s of snapshots) {
                const year = s.timestamp.slice(0, 4);
                byYear[year] = (byYear[year] || 0) + 1;
            }

            // Find non-200 status codes (historical issues)
            const historicalIssues = snapshots.filter(s => s.status_code !== '200');

            return NextResponse.json({
                success: true,
                total_snapshots: snapshots.length,
                snapshots_by_year: byYear,
                historical_issues: historicalIssues,
                recent_snapshots: snapshots.slice(-20).reverse(),
                analyzed: analyzed || null,
                query: { from: startDate, to: endDate, analyze },
                usage: {
                    all_snapshots: '/api/dhs-monitor?action=wayback',
                    date_range: '/api/dhs-monitor?action=wayback&from=2024-01-01&to=2024-12-31',
                    with_analysis: '/api/dhs-monitor?action=wayback&from=2024-01-01&analyze=true',
                    deep_scan: '/api/dhs-monitor?action=deepscan&from=2024-01-01&to=2024-12-31'
                }
            });
        }

        // ACTION: Deep scan - analyze archived pages for excuse banners
        if (action === 'deepscan' || action === 'scan') {
            const startDate = searchParams.get('from') || '2024-01-01';
            const endDate = searchParams.get('to') || undefined;

            const excuses = await deepScanHistoricalExcuses(startDate, endDate);

            // Group excuses by type
            const byType: Record<string, WaybackAnalysis[]> = {};
            for (const excuse of excuses) {
                const type = excuse.excuse_type || 'UNKNOWN';
                if (!byType[type]) byType[type] = [];
                byType[type].push(excuse);
            }

            // Group by month for timeline
            const byMonth: Record<string, number> = {};
            for (const excuse of excuses) {
                const month = excuse.date.slice(0, 7); // YYYY-MM
                byMonth[month] = (byMonth[month] || 0) + 1;
            }

            return NextResponse.json({
                success: true,
                total_excuses_found: excuses.length,
                excuses_by_type: Object.fromEntries(
                    Object.entries(byType).map(([type, items]) => [type, items.length])
                ),
                excuses_by_month: byMonth,
                all_excuses: excuses,
                query: { from: startDate, to: endDate },
                note: 'Deep scan samples ~50 archived pages across the date range'
            });
        }

        // ACTION: Get visual archive summary
        if (action === 'visual-archive') {
            const summaryPath = path.join(DATA_DIR, 'wayback-archive', 'archive_summary.csv');
            if (!existsSync(summaryPath)) {
                return NextResponse.json({ success: false, message: 'Archive summary not found' });
            }

            const content = await readFile(summaryPath, 'utf-8');
            const lines = content.split(/\r?\n/).filter(l => l.trim());
            const headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim().toLowerCase());

            const data = lines.slice(1).map(line => {
                const values = line.split(',');
                const obj: Record<string, string> = {};
                headers.forEach((h, i) => {
                    const keyMap: Record<string, string> = {
                        'timestamp': 'timestamp',
                        'date': 'date',
                        'httpstatus': 'http_status',
                        'hasexcuse': 'has_excuse',
                        'excusetype': 'excuse_type',
                        'filesize': 'file_size',
                        'filename': 'filename'
                    };
                    const targetKey = keyMap[h] || h;
                    obj[targetKey] = (values[i] || '').trim();
                });
                return obj;
            });

            return NextResponse.json({
                success: true,
                count: data.length,
                snapshots: data
            });
        }

        // ACTION: Get historical documents summary
        if (action === 'historical-docs') {
            const docsDir = path.join(DATA_DIR, 'historical-docs');
            const censusDir = path.join(process.cwd(), 'data', 'master-census');

            let allDocs: any[] = [];

            // 1. Process Wayback Recoveries
            if (existsSync(docsDir)) {
                const recoveryFiles = await readdir(docsDir);
                const recoveries = recoveryFiles.map((f: string) => {
                    const parts = f.split('_');
                    const timestamp = parts[0];
                    const category = parts[1]?.split('.')[0] || 'Unknown';
                    const ext = path.extname(f).slice(1).toUpperCase();
                    const date = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;

                    const typeLabel = category === 'CSV' ? 'Dataset' : (category === 'Glossary' ? 'Glossary' : 'Document');
                    const month = new Date(parseInt(timestamp.slice(0, 4)), parseInt(timestamp.slice(4, 6)) - 1).toLocaleString('default', { month: 'short' });

                    return {
                        filename: f,
                        title: `DHS Statewide ${typeLabel} (${month} ${timestamp.slice(0, 4)})`,
                        timestamp,
                        date,
                        category: 'Wayback Recovery',
                        type: ext,
                        path: `/api/dhs-monitor/doc/${f}?source=historical`
                    };
                });
                allDocs = [...allDocs, ...recoveries];
            }

            // 2. Process County Census Sweeps
            if (existsSync(censusDir)) {
                const censusFiles = await readdir(censusDir);
                const sweeps = censusFiles
                    .filter(f => f.endsWith('_providers.csv'))
                    .map((f: string) => {
                        const county = f.replace('_providers.csv', '').replace('_', ' ');
                        return {
                            filename: f,
                            title: `${county} County Provider Census`,
                            timestamp: '20260104000000', // Group at the end/sweep time
                            date: '2026-01-04',
                            category: 'Census Sweep',
                            type: 'CSV',
                            path: `/api/dhs-monitor/doc/${f}?source=census`
                        };
                    });
                allDocs = [...allDocs, ...sweeps];
            }

            return NextResponse.json({
                success: true,
                count: allDocs.length,
                documents: allDocs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

    } catch (error) {
        console.error('[DHS_MONITOR] Error:', error);
        return NextResponse.json({
            error: 'Monitor error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// POST endpoint for manual incident logging or screenshot upload
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const log = await loadLog();

        // Add manual incident
        if (body.incident) {
            const incident: SiteCheckResult = {
                timestamp: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().split(' ')[0],
                status: body.incident.status || 'down',
                excuse_type: body.incident.excuse_type || 'MANUAL_REPORT',
                excuse_text: body.incident.excuse_text || body.incident.notes,
                screenshot_path: body.incident.screenshot_path,
                news_correlation: body.incident.news_correlation
            };

            log.incidents.push(incident);
            log.total_checks++;
            log.last_check = incident.timestamp;

            if (incident.excuse_type) {
                log.excuse_frequency[incident.excuse_type] =
                    (log.excuse_frequency[incident.excuse_type] || 0) + 1;
            }

            await saveLog(log);

            return NextResponse.json({
                success: true,
                message: 'Incident logged',
                incident
            });
        }

        // Add news correlation to recent incident
        if (body.add_correlation && body.incident_timestamp) {
            const incident = log.incidents.find(i => i.timestamp === body.incident_timestamp);
            if (incident) {
                incident.news_correlation = incident.news_correlation || [];
                incident.news_correlation.push(body.add_correlation);
                await saveLog(log);

                return NextResponse.json({
                    success: true,
                    message: 'News correlation added',
                    incident
                });
            }
            return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({
            error: 'Failed to process request',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
