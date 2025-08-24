import React from 'react';
import { Card, Typography, Switch, Space, Divider } from 'antd';
import { useTheme } from '@/context/ThemeContext';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
  const { mode, toggle } = useTheme();

  return (
    <div className="p-4">
      <Card>
        <Title level={3}>Settings</Title>
        <Divider />

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark theme</div>
              <Text type="secondary">Switch UI to a black/dark theme</Text>
            </div>
            <Switch checked={mode === 'dark'} onChange={() => toggle()} />
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Settings;
