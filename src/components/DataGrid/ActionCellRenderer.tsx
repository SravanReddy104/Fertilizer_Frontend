import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DollarOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { GridAction } from '@/types';

interface ActionCellRendererProps {
  data: any;
  actions: GridAction[];
}

const ActionCellRenderer: React.FC<ActionCellRendererProps> = ({ data, actions }) => {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      edit: <EditOutlined />,
      delete: <DeleteOutlined />,
      view: <EyeOutlined />,
      payment: <DollarOutlined />,
      more: <MoreOutlined />,
    };
    return iconMap[iconName] || <MoreOutlined />;
  };

  return (
    <Space size="small">
      {actions.map((action, index) => {
        const isDisabled = action.disabled ? action.disabled(data) : false;
        
        return (
          <Tooltip key={index} title={action.tooltip}>
            <Button
              type="text"
              size="small"
              icon={getIcon(action.icon)}
              onClick={() => !isDisabled && action.onClick(data)}
              disabled={isDisabled}
              style={{ 
                color: action.color || '#666',
                padding: '4px 8px',
                height: 'auto'
              }}
            />
          </Tooltip>
        );
      })}
    </Space>
  );
};

export default ActionCellRenderer;
