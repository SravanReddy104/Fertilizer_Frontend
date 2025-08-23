import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Logged in successfully');
      navigate(from, { replace: true });
    } catch (e: any) {
      message.error(e?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card style={{ maxWidth: 380, width: '100%' }}>
        <div className="mb-4 text-center">
          <Title level={3}>Fertilizer Shop</Title>
          <Text type="secondary">Sign in to continue</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }]}> 
            <Input type="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter password' }]}> 
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Login</Button>
        </Form>
        <div className="mt-4 text-center">
          <Text type="secondary">New here? </Text>
          <Link to="/register">Create an account</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
