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
      },
    },
    // 生成 sourcemap 便于调试（生产环境可设为 false）
    sourcemap: false,
    // 设置警告阈值
    chunkSizeWarningLimit: 600,
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
  },
})
