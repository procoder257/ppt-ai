import { defineConfig } from 'vitest/config';
import path from 'path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        test: {
            environment: 'node',
            globals: true,
            setupFiles: ['dotenv/config'],
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        define: {
            'process.env': env,
        },
    };
});
