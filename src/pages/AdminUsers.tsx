import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Select, Switch, Popconfirm, Button, Typography, message, Card } from 'antd';
import { adminApi } from '@/services/api';

const { Title } = Typography;

type UserRow = {
  id: number;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at?: string;
};

const AdminUsers: React.FC = () => {
  const [data, setData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listUsers();
      setData(data);
    } catch (e: any) {
      message.error(e?.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (userId: number, role: 'admin' | 'user') => {
    try {
      await adminApi.setRole(userId, role);
      message.success('Role updated');
      setData(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (e: any) {
      message.error(e?.response?.data?.detail || 'Failed to update role');
    }
  };

  const updateActive = async (userId: number, is_active: boolean) => {
    try {
      await adminApi.setActive(userId, is_active);
      message.success(is_active ? 'User activated' : 'User blocked');
      setData(prev => prev.map(u => u.id === userId ? { ...u, is_active } : u));
    } catch (e: any) {
      message.error(e?.response?.data?.detail || 'Failed to update status');
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await adminApi.deleteUser(userId);
      message.success('User deleted');
      setData(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) {
      message.error(e?.response?.data?.detail || 'Failed to delete user');
    }
  };

  return (
    <div className="p-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="!mb-0">Admin Users</Title>
          <Button onClick={load} loading={loading}>Refresh</Button>
        </div>
        <Table<UserRow>
          rowKey="id"
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 80 },
            { title: 'Email', dataIndex: 'email' },
            { title: 'Name', dataIndex: 'full_name' },
            {
              title: 'Role',
              dataIndex: 'role',
              render: (_, row) => (
                <Space>
                  <Tag color={row.role === 'admin' ? 'geekblue' : 'default'}>{row.role.toUpperCase()}</Tag>
                  <Select value={row.role} style={{ width: 120 }}
                    onChange={(v) => updateRole(row.id, v)}
                    options={[{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }]} />
                </Space>
              )
            },
            {
              title: 'Active',
              dataIndex: 'is_active',
              render: (_, row) => (
                <Switch checked={row.is_active} onChange={(v) => updateActive(row.id, v)} />
              ),
            },
            {
              title: 'Actions',
              render: (_, row) => (
                <Space>
                  <Popconfirm title="Delete user?" onConfirm={() => deleteUser(row.id)}>
                    <Button danger>Delete</Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default AdminUsers;
