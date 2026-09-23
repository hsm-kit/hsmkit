import React from 'react';
import { Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { routeComponentMap } from './routeConfig';
import NotFoundPage from './pages/NotFoundPage';

interface AppProps {
  initialContentHtml?: string;
  initialPathname: string;
}

const App: React.FC<AppProps> = ({ initialContentHtml, initialPathname }) => {
  return (
    <MainLayout initialContentHtml={initialContentHtml} initialPathname={initialPathname}>
      {Object.entries(routeComponentMap).map(([path, Component]) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </MainLayout>
  );
};

export default App;
