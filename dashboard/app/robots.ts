import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration
 * Allows all crawlers, references sitemap
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/_next/'],
        },
        sitemap: [
            'https://projectcrosscheck.org/sitemap.xml',
            'https://mnfraudwatch.org/sitemap.xml',
            'https://powerplaypress.org/sitemap.xml',
            'https://paidleavewatch.org/sitemap.xml',
        ],
    };
}
