import React from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { PhoneOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ContactOwner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card 
        className="w-full max-w-lg shadow-2xl text-center"
        style={{ borderRadius: '16px' }}
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserOutlined className="text-white text-2xl" />
          </div>
          <Title level={2} className="text-red-600 mb-2">Access Denied</Title>
          <Text type="secondary" className="text-lg">
            You don't have permission to access this application
          </Text>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <Title level={4} className="mb-4">Contact Owner for Access</Title>
          
          <Space direction="vertical" size="large" className="w-full">
            <div className="flex items-center justify-center space-x-3">
              <UserOutlined className="text-blue-500 text-xl" />
              <div>
                <Text strong className="text-lg">Rajinikanth Reddy</Text>
                <br />
                <Text type="secondary">Shop Owner</Text>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <PhoneOutlined className="text-green-500 text-xl" />
              <div>
                <Text strong>Contact Number</Text>
                <br />
                <Text copyable className="text-lg">+91 XXXXXXXXXX</Text>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <MailOutlined className="text-purple-500 text-xl" />
              <div>
                <Text strong>Email Address</Text>
                <br />
                <Text copyable className="text-lg">rajinikanth@sravanifertilizers.com</Text>
              </div>
            </div>
          </Space>
        </div>

        <Paragraph type="secondary" className="mb-6">
          Please contact the owner to request access to the Sravani Fertilizer Shop management system. 
          You will need to provide your details and the reason for access.
        </Paragraph>

        <Space>
          <Button 
            type="primary" 
            icon={<PhoneOutlined />}
            size="large"
            onClick={() => window.open('tel:+91XXXXXXXXXX')}
          >
            Call Now
          </Button>
          <Button 
            icon={<MailOutlined />}
            size="large"
            onClick={() => window.open('mailto:rajinikanth@sravanifertilizers.com?subject=Access Request - Fertilizer Shop System')}
          >
            Send Email
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default ContactOwner;
