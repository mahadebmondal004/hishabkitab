import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png', 'logo192.png', 'logo512.png'],
            manifest: {
                name: 'Hishab Kitab',
                short_name: 'Hishab Kitab',
                description: 'Business Accounting & Invoice Management',
                theme_color: '#2563eb',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'logo.png',
                        sizes: '192x192 512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                cleanupOutdatedCaches: true,
                skipWaiting: true,
                clientsClaim: true,
                navigateFallback: null,
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => !url.protocol.startsWith('http'),
                        handler: 'NetworkOnly',
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        method: 'GET',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 300
                            },
                            networkTimeoutSeconds: 10
                        }
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        method: 'POST',
                        handler: 'NetworkOnly',
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        method: 'PUT',
                        handler: 'NetworkOnly',
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        method: 'DELETE',
                        handler: 'NetworkOnly',
                    }
                ]
            }
        })
    ],
    server: {
        port: 5173,
        strictPort: false, // Allow fallback if port is busy
        host: true, // Listen on all addresses
        allowedHosts: ['hishabkitab.codteg.com'],
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            },
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
