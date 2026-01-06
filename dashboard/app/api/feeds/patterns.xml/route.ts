import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * RSS Feed for Fraud Patterns
 * 
 * Provides RSS 2.0 feed of new fraud patterns
 */

interface FraudPattern {
    id: string;
    type: string;
    title: string;
    description: string;
    severity: string;
    detectedAt: string;
    evidence: string[];
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function generateRSSItem(pattern: FraudPattern, baseUrl: string): string {
    const pubDate = new Date(pattern.detectedAt || Date.now()).toUTCString();
    const link = `${baseUrl}/paid-leave-sandbox#pattern-${pattern.id}`;

    return `
    <item>
      <title>${escapeXml(`[${pattern.severity.toUpperCase()}] ${pattern.title}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(pattern.type)}</category>
      <description><![CDATA[
        <p><strong>Type:</strong> ${escapeXml(pattern.type)}</p>
        <p><strong>Severity:</strong> ${escapeXml(pattern.severity)}</p>
        <p>${escapeXml(pattern.description)}</p>
        ${pattern.evidence && pattern.evidence.length > 0 ? `
        <p><strong>Evidence:</strong></p>
        <ul>
          ${pattern.evidence.map(e => `<li>${escapeXml(e)}</li>`).join('')}
        </ul>
        ` : ''}
      ]]></description>
    </item>`;
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    try {
        // Fetch patterns from internal API
        const response = await fetch(`${baseUrl}/api/fraud/patterns`);

        let patterns: FraudPattern[] = [];
        if (response.ok) {
            const data = await response.json();
            patterns = (data.patterns || []).map((p: Record<string, unknown>) => ({
                id: p.id as string,
                type: p.type as string,
                title: p.title as string,
                description: p.description as string,
                severity: p.severity as string,
                detectedAt: p.detectedAt as string || new Date().toISOString(),
                evidence: p.evidence as string[] || []
            }));
        }

        const lastBuildDate = new Date().toUTCString();

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Paid Leave Watch - Fraud Pattern Alerts</title>
    <link>${baseUrl}/paid-leave-sandbox</link>
    <description>Real-time fraud pattern detection for Minnesota Paid Leave program. Automated analysis of claims, providers, and entity behaviors.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/api/feeds/patterns.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/assets/logos/og-image.png</url>
      <title>Paid Leave Watch</title>
      <link>${baseUrl}</link>
    </image>
    <ttl>60</ttl>
    ${patterns.map(p => generateRSSItem(p, baseUrl)).join('\n')}
  </channel>
</rss>`;

        return new NextResponse(rss, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'public, max-age=300'
            }
        });

    } catch (error) {
        console.error('[RSS] Feed generation error:', error);

        // Return minimal valid RSS on error
        return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Paid Leave Watch - Fraud Pattern Alerts</title>
    <link>${baseUrl}</link>
    <description>Feed temporarily unavailable</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8'
            }
        });
    }
}
