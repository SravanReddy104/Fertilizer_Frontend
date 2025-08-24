import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Space } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminApi } from '@/services/api';
import { GridColumn, GridAction } from '@/types';
import DataGrid from '@/components/DataGrid/DataGrid';

const { Option } = Select;

interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: users, isLoading, refetch } = useQuery('users', () => 
    adminApi.listUsers().then(res => res.data)
  );

  const createMutation = useMutation(
    (userData: { username: string; password: string; email?: string; full_name?: string; role: 'admin' | 'user' }) =>
      adminApi.createUser(userData),
    {
      onSuccess: () => {
        message.success('User created successfully');
        queryClient.invalidateQueries('users');
        setIsModalVisible(false);
        form.resetFields();
      },
      onError: () => {
        message.error('Failed to create user');
      }
    }
  );


  const deleteMutation = useMutation(adminApi.deleteUser, {
    onSuccess: () => {
      message.success('User deleted successfully');
      queryClient.invalidateQueries('users');
    },
    onError: () => {
      message.error('Failed to delete user');
    }
  });

  const columns: GridColumn[] = [
    { field: 'username', headerName: 'Username', width: 180 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'full_name', headerName: 'Full Name', width: 180 },
    { field: 'role', headerName: 'Role', width: 120 },
    { field: 'is_active', headerName: 'Active', width: 100 },
    { field: 'created_at', headerName: 'Created', width: 120, type: 'date' },
  ];

  const actions: GridAction[] = [
    {
      icon: 'delete',
      tooltip: 'Delete User',
      onClick: (data: User) => handleDelete(data),
      color: '#ff4d4f'
    }
  ];

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete user "${user.username}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(user.id),
    });
  };

  const handleSubmit = (values: any) => {
    createMutation.mutate(values);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Add User
          </Button>
        </div>

        <DataGrid
          data={users || []}
          columns={columns}
          actions={actions}
          loading={isLoading}
          onRefresh={refetch}
          enableExport={true}
          enableSearch={true}
          enableFilter={true}
          exportOptions={{
            filename: 'users',
            title: 'Users List'
          }}
        />
      </Card>

      <Modal
        title="Add New User"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please enter username' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email (Optional)"
            rules={[
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email address (optional)" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Full Name"
          >
            <Input placeholder="Enter full name (optional)" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
            initialValue="user"
          >
            <Select placeholder="Select user role">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createMutation.isLoading}
              >
                Create User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
