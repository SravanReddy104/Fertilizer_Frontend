import React from 'react';
import { Tag } from 'antd';

interface StatusCellRendererProps {
  value: string;
}

const StatusCellRenderer: React.FC<StatusCellRendererProps> = ({ value }) => {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { color: 'success', text: 'Paid' };
      case 'pending':
        return { color: 'warning', text: 'Pending' };
      case 'partial':
        return { color: 'processing', text: 'Partial' };
      case 'overdue':
        return { color: 'error', text: 'Overdue' };
      case 'active':
        return { color: 'success', text: 'Active' };
      case 'inactive':
        return { color: 'default', text: 'Inactive' };
      default:
        return { color: 'default', text: value || 'Unknown' };
    }
  };

  const config = getStatusConfig(value);

  return <Tag color={config.color}>{config.text}</Tag>;
};

export default StatusCellRenderer;
