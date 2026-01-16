import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import { routes } from './prerender.config'
import { writeFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 预渲染插件 - 仅在构建时运行
    prerender({
      routes,
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
          console.log('✅ Created root index.html');
        }
      },
    }),
  ],
  
  build: {
    // 代码分割配置 - 使用函数形式
    rollupOptions: {
      output: {
        // 手动分割代码块 - 优化 Ant Design 拆分
        manualChunks(id) {
          // React 核心
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          
          // Ant Design 图标库单独拆分（可以延迟加载）
          if (id.includes('node_modules/@ant-design/icons')) {
            return 'vendor-antd-icons';
          }
          
          // Ant Design 核心库 - 实用拆分策略
          // 策略：接受 core 稍大（因为内部依赖），但将其他组件拆分为小 chunk
          // 这样首屏加载 core，其他页面按需加载小 chunk，不会卡顿
          if (id.includes('node_modules/antd')) {
            // 首屏必需的核心组件（包含必要的内部依赖）
            // Layout, Menu, Typography, Button, Drawer, Tooltip, Spin, ConfigProvider
            // 这些组件有内部依赖，所以 core 会稍大，但这是必要的
            if (id.includes('antd/es/layout') || 
                id.includes('antd/es/menu') ||
                id.includes('antd/es/typography') || 
                id.includes('antd/es/button') || 
                id.includes('antd/es/drawer') ||
                id.includes('antd/es/tooltip') ||
                id.includes('antd/es/spin') ||
                id.includes('antd/es/config-provider') ||
                id.includes('antd/es/locale') ||
                id.includes('antd/es/theme') ||
                id.includes('antd/es/style')) {
              return 'vendor-antd-core';
            }
            
            // 表单组件（Input, Select, Tabs, Form）- 单独拆分，约 85KB
            if (id.includes('antd/es/input') || 
                id.includes('antd/es/select') || 
                id.includes('antd/es/tabs') ||
                id.includes('antd/es/form') ||
                id.includes('antd/es/upload') ||
                id.includes('antd/es/checkbox') ||
                id.includes('antd/es/radio') ||
                id.includes('antd/es/segmented') ||
                id.includes('antd/es/input-number')) {
              return 'vendor-antd-form';
            }
            
            // 数据展示组件（Card, Table, Tag, Alert, Divider）- 单独拆分，约 340KB
            if (id.includes('antd/es/card') || 
                id.includes('antd/es/table') || 
                id.includes('antd/es/tag') ||
                id.includes('antd/es/alert') ||
                id.includes('antd/es/divider') ||
                id.includes('antd/es/collapse') ||
                id.includes('antd/es/popover') ||
                id.includes('antd/es/space') ||
                id.includes('antd/es/row') ||
                id.includes('antd/es/col')) {
              return 'vendor-antd-display';
            }
            
            // 反馈组件（Message, Modal, Notification）- 单独拆分，约 40KB
            if (id.includes('antd/es/message') ||
                id.includes('antd/es/modal') ||
                id.includes('antd/es/notification')) {
              return 'vendor-antd-feedback';
            }
            
            // 其他 Ant Design 组件（较少使用）
            return 'vendor-antd-other';
          }
          
          // 加密库
          if (id.includes('node_modules/crypto-js') || 
              id.includes('node_modules/node-forge') || 
              id.includes('node_modules/hash-wasm')) {
            return 'vendor-crypto';
          }
          // ASN.1 解析
          if (id.includes('node_modules/asn1js') || 
              id.includes('node_modules/pvutils')) {
            return 'vendor-asn1';
          }
          // 其他工具库
          if (id.includes('node_modules/elliptic') || 
              id.includes('node_modules/base-x') || 
              id.includes('node_modules/iconv-lite')) {
            return 'vendor-utils';
          }
        },
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
    // CSS 代码分割 - 对于单页应用，禁用可以减少 HTTP 请求
    cssCodeSplit: false,
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
