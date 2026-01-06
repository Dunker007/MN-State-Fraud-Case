/**
 * Multi-Domain Routing Proxy (Next.js 16+)
 * 
 * Routes users to different landing pages based on their entry domain.
 * Migrated from middleware.ts to proxy.ts per Next.js 16 convention.
 * 
 * Domain Mapping:
 * - projectcrosscheck.org → / (Main Dashboard)
 * - powerplaypress.org → /power-play-press (News Feed)
 * - mnfraudwatch.org → /ops-center (Operations Center)
 * - paidleavewatch.org → / (Main Dashboard)
 * 
 * @author Alex Vance - Project CrossCheck
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Domain to landing page mapping
const DOMAIN_ROUTES: Record<string, string> = {
    // Primary investigator hub
    'projectcrosscheck.org': '/',
    'www.projectcrosscheck.org': '/',

    // Power Play Press standalone
    'powerplaypress.org': '/power-play-press',
    'www.powerplaypress.org': '/power-play-press',

    // Public awareness (uses default landing)
    'mnfraudwatch.org': '/ops-center',
    'www.mnfraudwatch.org': '/ops-center',

    // Future expansion
    'paidleavewatch.org': '/',
    'www.paidleavewatch.org': '/',
};

// Paths that should NOT be redirected (API routes, static assets, etc.)
const EXCLUDED_PATHS = [
    '/api/',
    '/_next/',
    '/favicon',
    '/images/',
    '/fonts/',
    '/static/',
];

export function proxy(request: NextRequest) {
    const { pathname, host } = request.nextUrl;

    // Skip excluded paths
    if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Get hostname without port
    const hostname = host?.split(':')[0] || '';

    // Check if this domain has a custom landing page
    const targetRoute = DOMAIN_ROUTES[hostname];

    // Only redirect if:
    // 1. Domain has a custom route configured
    // 2. User is hitting the root path
    // 3. Target route is different from current
    if (targetRoute && pathname === '/' && targetRoute !== '/') {
        const url = request.nextUrl.clone();
        url.pathname = targetRoute;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    // Run middleware on all routes except static files
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
