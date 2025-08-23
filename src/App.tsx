import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout, theme } from 'antd';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Debts from './pages/Debts';
import { useRealTimeUpdates } from './hooks/useRealTimeUpdates';
import Settings from './pages/Settings';

const { Content } = Layout;

function App() {
  // Enable real-time updates
  useRealTimeUpdates({ enabled: false});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isAuthRoute = false;
  const { token } = theme.useToken();

  return (
    <ErrorBoundary>
      <Layout style={{ minHeight: '100vh' }}>
        {!isAuthRoute && (
          <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        )}
        <Layout>
          {!isAuthRoute && (
            <Header
              collapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
            />
          )}
          <Content style={{ margin: '16px', background: token.colorBgLayout }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/debts" element={<Debts />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
