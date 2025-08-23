import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ConfigProvider, theme as antdTheme } from 'antd'
import App from './App.tsx'
import './index.css'
import { ThemeProvider, useTheme } from './context/ThemeContext'

// AG Grid CSS imports
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const ThemedProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0ea5e9',
          borderRadius: 6,
        },
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedProviders>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemedProviders>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
