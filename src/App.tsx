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
import Login from './pages/Login';
import Register from './pages/Register';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';

const { Content } = Layout;

function App() {
  // Enable real-time updates
  useRealTimeUpdates({ enabled: false});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
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
          <Content style={{ margin: isAuthRoute ? 0 : '16px', background: isAuthRoute ? 'transparent' : token.colorBgLayout }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
              <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
              <Route path="/debts" element={<ProtectedRoute><Debts /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
