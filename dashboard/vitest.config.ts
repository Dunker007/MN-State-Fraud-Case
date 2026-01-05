import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['lib/**/*.ts', 'components/**/*.tsx'],
            exclude: ['node_modules', 'tests', '**/*.d.ts'],
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
        },
    },
});
