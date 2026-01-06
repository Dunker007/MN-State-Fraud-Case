'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollIndicatorProps {
    containerId?: string;
}

/**
 * Horizontal scroll indicators for touch-optimized navigation
 * Shows left/right arrows when content is scrollable
 */
export default function ScrollIndicator({ containerId = 'nav-scroll' }: ScrollIndicatorProps) {
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Find the scrollable container
        const container = containerId
            ? document.getElementById(containerId)
            : scrollRef.current;

        if (!container) return;
        scrollRef.current = container as HTMLElement;

        const checkScroll = () => {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current!;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        };

        checkScroll();
        scrollRef.current.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        return () => {
            scrollRef.current?.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [containerId]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 200;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <>
            {/* Left Indicator */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent flex items-center justify-start pl-2 z-10 hover:from-black/90 transition-colors"
                    arial-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5 text-white animate-pulse" />
                </button>
            )}

            {/* Right Indicator */}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent flex items-center justify-end pr-2 z-10 hover:from-black/90 transition-colors"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5 text-white animate-pulse" />
                </button>
            )}
        </>
    );
}
