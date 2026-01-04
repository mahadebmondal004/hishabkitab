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
                // Disable offline caching by not precaching anything
                globPatterns: [],
                cleanupOutdatedCaches: true,
                skipWaiting: true,
                clientsClaim: true,
                // No runtime caching
                runtimeCaching: []
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
