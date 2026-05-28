import React from 'react';
import { Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { routeComponentMap } from './routeConfig';

const NotFoundPage = routeComponentMap['/'];

const App: React.FC = () => {
  return (
    <MainLayout>
      {Object.entries(routeComponentMap).map(([path, Component]) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </MainLayout>
  );
};

export default App;
