import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Swipe Left on the Left | Project CrossCheck',
    description: 'Review the chain of failure. Swipe left to reject Minnesota officials who enabled $9B+ in fraud.',
    openGraph: {
        title: 'Swipe Left on the Left',
        description: 'Tinder-style accountability. Review the chain of failure. Minnesota deserves better.',
        type: 'website',
        images: [
            {
                url: '/assets/logos/swipe-left-og.png',
                width: 1200,
                height: 630,
                alt: 'Swipe Left on the Left - Minnesota Accountability',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Swipe Left on the Left 🗳️',
        description: 'I just reviewed MN\'s chain of failure. Swipe to hold officials accountable.',
        images: ['/assets/logos/swipe-left-og.png'],
    },
};

export default function SwipeLeftLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
