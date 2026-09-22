import { StrictMode } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './i18n'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './hooks/useLanguage'
import { ThemeProvider } from './hooks/useTheme'
import { ErrorBoundary } from './components/common'

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

// Puppeteer prerender output is a browser DOM snapshot, not React SSR markup.
// Replace it while hidden instead of attempting hydration and forcing React to
// discard the visible tree after a mismatch.
rootEl.replaceChildren();
const root = createRoot(rootEl);
flushSync(() => root.render(app));
rootEl.style.visibility = '';
document.getElementById('client-render-guard')?.remove();
delete document.documentElement.dataset.clientRender;
