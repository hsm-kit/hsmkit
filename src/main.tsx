import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import { registerServiceWorker } from './registerSW'
import { LanguageProvider } from './hooks/useLanguage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)

// 注册 Service Worker（PWA 支持）
// registerServiceWorker()
