import React, { lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import GuidesLayout from './layouts/GuidesLayout';

const GuidesListPage = lazy(() => import('./pages/guides/GuidesListPage'));
const GuidesCategoryPage = lazy(() => import('./pages/guides/GuidesCategoryPage'));
const GuideDetailPage = lazy(() => import('./pages/guides/GuideDetailPage'));

const categorySlugs = ['keys', 'payment', 'cipher', 'pki', 'generic'];

const LeaveGuides = () => {
  const location = useLocation();
  useEffect(() => {
    window.location.replace(`${location.pathname}${location.search}${location.hash}`);
  }, [location]);
  return null;
};

const GuidesApp: React.FC = () => (
  <GuidesLayout>
    <Routes>
      <Route path="/guides" element={<GuidesListPage />} />
      {categorySlugs.map(category => (
        <Route key={`en-${category}`} path={`/guides/${category}`} element={<GuidesCategoryPage />} />
      ))}
      <Route path="/guides/:slug" element={<GuideDetailPage />} />

      <Route path="/:lang/guides" element={<GuidesListPage />} />
      {categorySlugs.map(category => (
        <Route key={`zh-${category}`} path={`/zh/guides/${category}`} element={<GuidesCategoryPage />} />
      ))}
      <Route path="/:lang/guides/:slug" element={<GuideDetailPage />} />
      <Route path="*" element={<LeaveGuides />} />
    </Routes>
  </GuidesLayout>
);

export default GuidesApp;
