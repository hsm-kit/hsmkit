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
const initialContentHtml = rootEl.querySelector<HTMLElement>('#main-content > div')?.innerHTML;
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
