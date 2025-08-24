import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/products',
      icon: <DatabaseOutlined />,
      label: 'Products',
    },
    {
      key: '/sales',
      icon: <ShoppingCartOutlined />,
      label: 'Sales',
    },
    {
      key: '/purchases',
      icon: <ShopOutlined />,
      label: 'Purchases',
    },
    {
      key: '/debts',
      icon: <CreditCardOutlined />,
      label: 'Debts',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={250}
      collapsedWidth={0}
      breakpoint="md"
      onBreakpoint={(broken) => setCollapsed(broken)}
      trigger={null}
      style={{
        background: token.colorBgContainer,
        boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
        position: 'relative',
      }}
    >
      <div className="flex items-center justify-center h-16" style={{ borderBottom: `1px solid ${token.colorBorder}` }}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FS</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-800">Sravani Fertilizer Shop</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          )}
        </div>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ 
          border: 'none',
          marginTop: '16px'
        }}
      />
    </Sider>
  );
}
;

export default Sidebar;
