import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Login successful');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.detail || 'Login failed';
      
      // Check if it's an authentication error (401 or invalid credentials)
      if (error?.response?.status === 401 || 
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('incorrect') ||
          errorMessage.toLowerCase().includes('unauthorized')) {
        message.error('Invalid credentials. Redirecting to contact owner page...');
        // Redirect to contact owner page after a short delay
        setTimeout(() => {
          navigate('/contact-owner', { replace: true });
        }, 2000);
      } else {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card 
        className="w-full max-w-md shadow-2xl"
        style={{ borderRadius: '16px' }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">FS</span>
          </div>
          <Title level={2} className="mb-2">Sravani Fertilizer Shop</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please enter your username' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
              style={{ height: '48px' }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <Alert
            message="Access Required"
            description="Contact the administrator to get your login credentials."
            type="info"
            showIcon
            style={{ textAlign: 'left' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default Login;
