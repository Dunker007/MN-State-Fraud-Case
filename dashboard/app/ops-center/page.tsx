import { Suspense } from 'react';
import OpsCenter from '@/components/OpsCenterClient';

// Force dynamic rendering to prevent static prerendering issues with useRouter/useSearchParams
export const dynamic = 'force-dynamic';

function OpsCenterLoading() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-500 font-mono text-sm">Loading Operations Center...</p>
            </div>
        </main>
    );
}

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'OPS CENTER | MN Provider Network',
    description: 'Strategic map of 22,087 MN-DHS providers. Real-time risk scoring and geographic density analysis.',
    openGraph: {
        title: 'OPS CENTER | MN Provider Network',
        description: 'Strategic map of 22,087 MN-DHS providers. Real-time risk scoring and geographic density analysis.',
        url: 'https://projectcrosscheck.org/ops-center',
        siteName: 'Project CrossCheck',
        images: [
            {
                url: '/assets/logos/crosscheck-literal.png',
                width: 1200,
                height: 630,
                alt: 'Ops Center - Provider Network Map',
            },
        ],
        type: 'website',
    },
};

export default function OpsCenterPage() {
    return (
        <Suspense fallback={<OpsCenterLoading />}>
            <OpsCenter />
        </Suspense>
    );
}
