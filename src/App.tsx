import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ProfilePage } from './pages/ProfilePage';
import { CleanPage } from './pages/CleanPage';
import { QualityPage } from './pages/QualityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ExportPage } from './pages/ExportPage';

function PageRouter() {
  const { state } = useData();

  switch (state.activeTab) {
    case 'dashboard':
      return <DashboardPage />;
    case 'upload':
      return <UploadPage />;
    case 'profile':
      return <ProfilePage />;
    case 'clean':
      return <CleanPage />;
    case 'quality':
      return <QualityPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'reports':
      return <ReportsPage />;
    case 'export':
      return <ExportPage />;
    default:
      return <UploadPage />;
  }
}

export default function App() {
  return (
    <DataProvider>
      <Layout>
        <PageRouter />
      </Layout>
    </DataProvider>
  );
}
