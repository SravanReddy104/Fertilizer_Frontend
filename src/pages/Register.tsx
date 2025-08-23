import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/';
  const { login } = useAuth();

  const onFinish = async (values: { full_name?: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await authApi.register(values.email, values.password, values.full_name);
      // Auto-login after registration
      await login(values.email, values.password);
      message.success('Registered and logged in');
      navigate(from, { replace: true });
    } catch (e: any) {
      message.error(e?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card style={{ maxWidth: 420, width: '100%' }}>
        <div className="mb-4 text-center">
          <Title level={3}>Create your account</Title>
          <Text type="secondary">First user becomes admin automatically</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="full_name" label="Full name">
            <Input placeholder="Your name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }]}> 
            <Input type="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter password' }, { min: 6, message: 'Min 6 characters' }]}> 
            <Input.Password placeholder="Create a password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Register</Button>
        </Form>
        <div className="mt-4 text-center">
          <Text type="secondary">Already have an account? </Text>
          <Link to="/login">Log in</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
