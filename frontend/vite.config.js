import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://localhost:3000',
                ws: true,
            },
        },
        headers: {
            'Content-Security-Policy': "\n        default-src 'self';\n        script-src 'self' 'unsafe-inline' 'unsafe-eval';\n        style-src 'self' 'unsafe-inline';\n        img-src 'self' data: https:;\n        font-src 'self' data:;\n        connect-src 'self' http://localhost:3000;\n      ".replace(/\s+/g, ' ').trim(),
        },
    },
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'mantine': ['@mantine/core', '@mantine/hooks', '@mantine/form', '@mantine/notifications'],
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                },
            },
        },
    },
});
