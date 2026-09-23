import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import { VitePWA } from 'vite-plugin-pwa'
import { appRoutes } from './prerender.config'
import { writeFileSync } from 'fs'
import { join, resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'bing-site-verification',
      transformIndexHtml(html) {
        const verificationCode = process.env.BING_SITE_AUTH?.trim();
        if (!verificationCode) return html;
        if (!/^[a-z0-9_-]+$/i.test(verificationCode)) {
          throw new Error('BING_SITE_AUTH contains unsupported characters.');
        }
        return html.replace('</head>', `    <meta name="msvalidate.01" content="${verificationCode}" />\n  </head>`);
      },
    },
    {
      name: 'guides-dev-entry',
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          const pathname = request.url?.split('?')[0] || '';
          if (/^\/(?:[a-z]{2}\/)?guides(?:\/|$)/.test(pathname)) {
            request.url = '/guides.html';
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((request, _response, next) => {
          const pathname = request.url?.split('?')[0] || '';
          if (/^\/(?:zh\/)?guides(?:\/[^.]*)?$/.test(pathname)) {
            request.url = `${pathname.replace(/\/$/, '')}/index.html`;
          }
          next();
        });
      },
    },
    react(),
    // PWA 插件 - 生成 Service Worker 和 Manifest
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-48.png', 'favicon-192.png', 'favicon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'HSM Kit - Encryption & Key Management Tools',
        short_name: 'HSM Kit',
        description: 'Free online encryption toolkit with AES, DES, RSA, ECC, HSM key management, TR-31, KCV, PIN block, and 44+ cryptographic tools. 100% client-side.',
        theme_color: '#8B5CF6',
        background_color: '#f8f9fb',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'favicon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'favicon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'AES Encryption',
            short_name: 'AES',
            url: '/aes-encryption',
            icons: [{ src: 'favicon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Key Generator',
            short_name: 'Keys',
            url: '/keys-dea',
            icons: [{ src: 'favicon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Guides',
            short_name: 'Guides',
            url: '/guides',
            icons: [{ src: 'favicon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: [
          'offline.html',
          'assets/**/*.css',
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'page-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              precacheFallback: {
                fallbackURL: '/offline.html',
              },
            },
          },
          {
            urlPattern: ({ request, url }) => url.pathname.startsWith('/assets/')
              && ['script', 'style', 'worker'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'asset-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
    // 预渲染插件 - 仅在构建时运行
    prerender({
      routes: appRoutes,
      renderer: '@prerenderer/renderer-puppeteer',
      // 指定入口 HTML 文件
      indexPath: 'index.html',
      rendererOptions: {
        // 使用自定义事件来标记页面准备就绪
        renderAfterDocumentEvent: 'prerender-ready',
        // 超时时间（毫秒）- 等待懒加载组件和语言切换
        timeout: 60000,
        // 最大并发数
        maxConcurrentRoutes: 3,
        // 注入 prerender 标志
        injectProperty: '__PRERENDER_INJECTED',
        inject: { isPrerendering: true },
        // Puppeteer 启动参数
        launchOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
      // 后处理 - 优化预渲染的 HTML
      postProcess(renderedRoute) {
        // 移除预渲染注入的脚本
        renderedRoute.html = renderedRoute.html
          .replace(/<script[^>]*>window\.__PRERENDER_INJECTED[^<]*<\/script>/g, '');

        // 处理根路径 - 直接写入 index.html
        if (renderedRoute.route === '/') {
          const outputPath = join(process.cwd(), 'dist', 'index.html');
          writeFileSync(outputPath, renderedRoute.html);
        }
      },
    }),
  ],
  
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        guides: resolve(process.cwd(), 'guides.html'),
      },
      output: {
        // 优化 chunk 文件命名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 生成 sourcemap 便于调试（生产环境可设为 false）
    sourcemap: false,
    // 设置警告阈值
    chunkSizeWarningLimit: 600,
    // 启用压缩 - rolldown 默认使用内置压缩器
    // minify 默认为 true，不需要显式设置
    cssCodeSplit: true,
    // 优化构建输出
    reportCompressedSize: false, // 禁用压缩大小报告以加快构建速度
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'crypto-js',
    ],
    // 排除不需要预构建的依赖
    exclude: [],
    // rolldown-vite 会自动处理优化，不需要额外配置
  },
  
  // 确保 tree-shaking 正常工作（rolldown 自动处理）
})
