import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import GuidesApp from './GuidesApp';
import { GuidesLanguageProvider } from './hooks/GuidesLanguageProvider';
import { ThemeProvider } from './hooks/useTheme';
import GuidesErrorBoundary from './components/common/GuidesErrorBoundary';

const rootElement = document.getElementById('root')!;
const app = (
  <StrictMode>
    <GuidesErrorBoundary>
      <BrowserRouter>
        <GuidesLanguageProvider>
          <ThemeProvider>
            <GuidesApp />
          </ThemeProvider>
        </GuidesLanguageProvider>
      </BrowserRouter>
    </GuidesErrorBoundary>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
