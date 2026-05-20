import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './hooks/useLanguage'
import { ThemeProvider } from './hooks/useTheme'
import { ErrorBoundary } from './components/common'

// One-time migration: force unregister old service workers (before autoUpdate was enabled)
// This runs once to clean up the old SW, then the new SW takes over with skipWaiting+clientsClaim
if ('serviceWorker' in navigator && !localStorage.getItem('sw-migrated-v2')) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      for (const reg of registrations) {
        reg.unregister();
      }
      caches.keys().then(names => {
        for (const name of names) {
          caches.delete(name);
        }
        localStorage.setItem('sw-migrated-v2', '1');
        // Reload to let new SW register fresh
        window.location.reload();
      });
    } else {
      localStorage.setItem('sw-migrated-v2', '1');
    }
  });
}

const rootEl = document.getElementById('root')!;

const app = (
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);

// If prerendered HTML exists, hydrate instead of replacing DOM to avoid a visible "jump".
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
