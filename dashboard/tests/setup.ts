import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
    default: ({ src, alt, ..._props }: { src: string; alt: string;[key: string]: unknown }) => {
        // Return a simple img element for tests
        return `<img src="${src}" alt="${alt}" />`;
    },
}));

// Suppress console errors in tests unless explicitly testing error handling
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is no longer supported')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
