import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

// `npm run build`        -> normal build for Vercel (dist/), installable + offline (PWA)
// `npm run build:single` -> one self-contained HTML file (dist-single/), no PWA
const pwa = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['logo.svg', 'apple-touch-icon.png'],
  manifest: {
    name: 'World View',
    short_name: 'World View',
    description: 'Spin the globe and meet all 195 countries.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#D6EEFF',
    theme_color: '#D6EEFF',
    categories: ['education', 'kids'],
    icons: [
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    // The globe code is about 2 MB, so allow it in the offline cache
    maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
    globPatterns: ['**/*.{js,css,html,svg,png}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: { cacheName: 'fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
      },
      {
        // Wikipedia photo lookups and the photos themselves
        urlPattern: /^https:\/\/(en\.wikipedia\.org\/api|upload\.wikimedia\.org)\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'photos', expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 60 }, cacheableResponse: { statuses: [0, 200] } },
      },
    ],
  },
})

// In the single-file build, inline the favicon and drop the PWA-only links
const singleHtml = {
  name: 'single-html',
  transformIndexHtml: { order: 'post', handler(html) {
    const svg = readFileSync(new URL('./public/logo.svg', import.meta.url), 'utf8')
    return html
      .replace(/href="[^"]*logo\.svg"/, `href="data:image/svg+xml,${encodeURIComponent(svg)}"`)
      .replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '')
  } },
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile(), singleHtml] : [pwa])],
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    chunkSizeWarningLimit: 2500,
  },
}))
