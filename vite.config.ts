import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  build: {
    // 代码分割配置 - 使用函数形式
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks(id) {
          // React 核心
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          // Ant Design UI 库
          if (id.includes('node_modules/antd') || 
              id.includes('node_modules/@ant-design')) {
            return 'vendor-antd';
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
  },
})
