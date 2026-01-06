import { MetadataRoute } from 'next';

/**
 * Dynamic sitemap generation for all Project CrossCheck pages
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://projectcrosscheck.org';
    const now = new Date();

    // Core pages
    const routes = [
        '',
        '/ops-center',
        '/power-play-press',
        '/paid-leave-watch',
        '/paid-leave-sandbox',
        '/penalty-box',
        '/about',
        '/methodology',
        '/org-chart-interactive',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));
}
