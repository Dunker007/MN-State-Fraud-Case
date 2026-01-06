import { Metadata } from 'next';
import Script from 'next/script';

interface SEOConfig {
    title: string;
    description: string;
    domain: string;
    keywords?: string[];
    image?: string;
}

/**
 * Generate comprehensive SEO metadata for a page
 */
export function generateSEOMetadata(config: SEOConfig): Metadata {
    const { title, description, domain, keywords = [], image = '/assets/logos/og-image.png' } = config;

    const fullUrl = `https://${domain}`;
    const imageUrl = `${fullUrl}${image}`;

    return {
        title,
        description,
        keywords: ['Minnesota fraud', 'DHS investigation', 'Paid Leave', 'government accountability', ...keywords],
        openGraph: {
            title,
            description,
            url: fullUrl,
            siteName: 'Project CrossCheck',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
            creator: '@ProjectCrosscheck',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: fullUrl,
        },
    };
}

/**
 * Generate JSON-LD structured data
 */
export function generateStructuredData(type: 'WebSite' | 'WebPage' | 'Organization', data: any) {
    const baseStructure = {
        '@context': 'https://schema.org',
        '@type': type,
    };

    switch (type) {
        case 'WebSite':
            return {
                ...baseStructure,
                name: data.name || 'Project CrossCheck',
                url: data.url || 'https://projectcrosscheck.org',
                description: data.description || 'Minnesota fraud investigation and forensic audit dashboard',
                publisher: {
                    '@type': 'Organization',
                    name: 'Project CrossCheck',
                    logo: {
                        '@type': 'ImageObject',
                        url: 'https://projectcrosscheck.org/assets/logos/crosscheck-literal.png',
                    },
                },
            };

        case 'WebPage':
            return {
                ...baseStructure,
                name: data.name,
                description: data.description,
                url: data.url,
                datePublished: data.datePublished || new Date().toISOString(),
                dateModified: data.dateModified || new Date().toISOString(),
                mainEntity: {
                    '@type': 'Thing',
                    name: data.name,
                    description: data.description,
                },
            };

        case 'Organization':
            return {
                ...baseStructure,
                name: 'Project CrossCheck',
                url: 'https://projectcrosscheck.org',
                logo: 'https://projectcrosscheck.org/assets/logos/crosscheck-literal.png',
                description: 'Independent investigative journalism and forensic analysis of Minnesota state fraud',
                sameAs: [
                    'https://twitter.com/ProjectCrosscheck',
                    'https://github.com/Dunker007/MN-State-Fraud-Case',
                ],
            };

        default:
            return baseStructure;
    }
}

/**
 * Structured Data Script Component
 */
export function StructuredDataScript({ data }: { data: any }) {
    return (
        <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

/**
 * Domain-specific SEO configurations
 */
export const DOMAIN_SEO_CONFIG: Record<string, SEOConfig> = {
    'projectcrosscheck.org': {
        title: 'PROJECT CROSSCHECK | Minnesota Fraud Forensic Audit',
        description: 'Independent forensic analysis of Minnesota state fraud. Real-time tracking of $9B+ in fraudulent diversions.',
        domain: 'projectcrosscheck.org',
        keywords: ['Minnesota fraud', 'forensic audit', 'Feeding Our Future', 'DHS fraud'],
    },
    'mnfraudwatch.org': {
        title: 'MN Fraud Watch | Operations Center',
        description: 'Strategic operations center for Minnesota fraud monitoring and provider network analysis.',
        domain: 'mnfraudwatch.org',
        keywords: ['MN fraud', 'provider network', 'fraud detection', 'operations'],
    },
    'powerplaypress.org': {
        title: 'Power Play Press | Minnesota Fraud Intelligence',
        description: 'Real-time news and intelligence feed tracking Minnesota fraud investigations and legislative action.',
        domain: 'powerplaypress.org',
        keywords: ['Minnesota news', 'fraud investigation', 'legislative tracking', 'GDELT'],
    },
    'paidleavewatch.org': {
        title: 'Paid Leave Watch | Insolvency Tracker',
        description: 'Tracking Minnesota Paid Leave fund health, insolvency projections, and fraud vectors.',
        domain: 'paidleavewatch.org',
        keywords: ['Paid Leave Minnesota', 'DEED fraud', 'insolvency', 'fund tracking'],
    },
};
