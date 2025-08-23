import React from 'react';
import { Layout, Button, Space, Avatar, Dropdown, MenuProps, theme } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  SettingOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const getPageTitle = (pathname: string) => {
    const titles: Record<string, string> = {
      '/': 'Dashboard',
      '/products': 'Products Management',
      '/sales': 'Sales Management',
      '/purchases': 'Purchases Management',
      '/debts': 'Debts Management',
    };
    return titles[pathname] || 'Dashboard';
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const onUserMenuClick: MenuProps['onClick'] = async ({ key }) => {
    if (key === 'settings') {
      navigate('/settings');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AntHeader 
      style={{ 
        background: token.colorBgContainer, 
        padding: '0 24px',
        borderBottom: `1px solid ${token.colorBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div className="flex items-center gap-3">
        <Button
          type="text"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        />
        <h2 className="text-xl font-semibold text-gray-800 m-0">
          {getPageTitle(location.pathname)}
        </h2>
        <p className="text-sm text-gray-500 m-0">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <Space size="middle">
        <Button 
          type="text" 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          className="flex items-center"
        >
          Refresh
        </Button>

        <Button 
          type="text" 
          icon={<BellOutlined />} 
          className="flex items-center"
        />

        <Dropdown 
          menu={{ items: userMenuItems, onClick: onUserMenuClick }} 
          placement="bottomRight"
          arrow
        >
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
            <Avatar icon={<UserOutlined />} />
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-700">User</div>
              <div className="text-xs text-gray-500">Dashboard</div>
            </div>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
