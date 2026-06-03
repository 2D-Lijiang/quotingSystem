import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { QuotationPage } from '@/pages/QuotationPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { TemplateEditorPage } from '@/pages/TemplateEditorPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { HistoryDetailPage } from '@/pages/HistoryDetailPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { Toast } from '@/components/ui';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<QuotationPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="templates/create" element={<TemplateEditorPage />} />
          <Route path="templates/edit/:id" element={<TemplateEditorPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<HistoryDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toast />
    </BrowserRouter>
  );
};

export default App;
