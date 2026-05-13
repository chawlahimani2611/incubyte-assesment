import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import ErrorBoundary from './components/common/ErrorBoundary';

// Configure TanStack React Query Client with sensible production defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      // Don't retry mutations — they may have side effects
      retry: 0,
    },
  },
});

/**
 * Enterprise Application Root
 *
 * Configures core routing, global Ant Design theme, query caching,
 * and wraps the entire tree in a global React ErrorBoundary.
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#2563eb',
              fontFamily:
                "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              borderRadius: 8,
              colorLink: '#2563eb',
            },
            components: {
              Table: {
                headerBg: '#f8fafc',
                rowHoverBg: '#f0f7ff',
              },
              Card: {
                boxShadowTertiary: 'none',
              },
            },
          }}
        >
          {/* AntApp provides notification, modal, message imperative APIs globally */}
          <AntApp>
            <BrowserRouter>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/employees" element={<Employees />} />
                  {/* 404 fallback */}
                  <Route
                    path="*"
                    element={
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '50vh',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        <h2 style={{ margin: 0, color: '#374151' }}>404 — Page Not Found</h2>
                        <p style={{ color: '#6b7280' }}>
                          The page you're looking for doesn't exist.
                        </p>
                      </div>
                    }
                  />
                </Routes>
              </AppLayout>
            </BrowserRouter>
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
