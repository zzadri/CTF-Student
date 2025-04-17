import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Liste de fichiers sensibles à bloquer explicitement
const sensitiveFiles = [
  'package.json',
  'package-lock.json',
  '.git',
  '.env',
  '.env.local',
  '.env.development',
  'vite.config.ts',
  'vite.config.js',
  'tsconfig.json'
];

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'secure-server',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    const url = req.url || '';
                    
                    // Permettre l'accès aux fichiers node_modules utilisés par Vite
                    if (url.includes('/node_modules/')) {
                        // Vérifier si c'est un accès à des fichiers nécessaires au fonctionnement de l'app
                        const isAllowedDependency = 
                            url.includes('/node_modules/@mantine/') || 
                            url.includes('/node_modules/.vite/') ||
                            url.includes('/node_modules/vite/dist/client/') ||
                            url.includes('/node_modules/react') ||
                            url.includes('/node_modules/react-dom');
                            
                        if (isAllowedDependency) {
                            return next();
                        }
                    }
                    
                    // Vérifier si l'URL contient des chemins sensibles
                    const isSensitivePath = sensitiveFiles.some(file => 
                        url.includes(`/${file}`) || url.includes(`%2F${file}`) || url.includes(encodeURIComponent(`/${file}`))
                    );
                    
                    // Vérifier les tentatives d'injection ou de traversée de répertoire
                    const hasPathTraversal = url.includes('../') || 
                                            url.includes('..%2F') || 
                                            url.includes('%2e%2e%2f') ||
                                            url.includes('..\\') ||
                                            url.includes('file:');
                    
                    // Vérifier les tentatives d'exécution de commandes
                    const hasCommandInjection = url.includes('cmd=') || 
                                                url.includes('exec') || 
                                                url.includes('EXEC') ||
                                                url.includes('timeout') ||
                                                url.includes('sleep');
                    
                    if (isSensitivePath || hasPathTraversal || hasCommandInjection) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    
                    next();
                });
            }
        }
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: true,
        fs: {
            allow: [
                // Autoriser les répertoires nécessaires à l'application
                path.resolve(__dirname, './src'),
                path.resolve(__dirname, './public'),
                path.resolve(__dirname, './node_modules'),
            ],
            strict: true,
        },
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
            'Content-Security-Policy': `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval';
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: https:;
            font-src 'self' data:;
            connect-src 'self' http://localhost:3000 ws://localhost:*;
            form-action 'self';
            frame-ancestors 'self';
            object-src 'none';
            base-uri 'self';
            `.replace(/\s+/g, ' ').trim(),
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
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
