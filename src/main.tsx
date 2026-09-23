import { StrictMode } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import i18n, { loadLanguage } from './i18n'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './hooks/useLanguage'
import { ThemeProvider } from './hooks/useTheme'
import { ErrorBoundary } from './components/common'
import { getToolRouteLanguage } from './utils/toolPath'

const routeLanguage = getToolRouteLanguage(window.location.pathname);
if (routeLanguage && routeLanguage !== 'en') {
  await loadLanguage(routeLanguage);
  await i18n.changeLanguage(routeLanguage);
}

const rootEl = document.getElementById('root')!;
const initialContentHtml = document.documentElement.dataset.theme === 'dark'
  ? undefined
  : rootEl.querySelector<HTMLElement>('#main-content > div')?.innerHTML;
const initialPathname = window.location.pathname;

const app = (
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <ThemeProvider>
            <App initialContentHtml={initialContentHtml} initialPathname={initialPathname} />
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);

rootEl.replaceChildren();
const root = createRoot(rootEl);
flushSync(() => root.render(app));
