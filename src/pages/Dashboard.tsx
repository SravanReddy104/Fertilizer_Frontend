import React from 'react';
import { Row, Col, Card, Statistic, List, Tag } from 'antd';
import { 
  DollarOutlined, 
  ShoppingOutlined, 
  CreditCardOutlined,
  DatabaseOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useQuery } from 'react-query';
import { dashboardApi } from '@/services/api';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard: React.FC = () => {
  const { data: stats } = useQuery('dashboard-stats', 
    () => dashboardApi.getStats().then(res => res.data),
    { retry: 1, refetchOnWindowFocus: false }
  );
  
  const { data: salesTrend } = useQuery('sales-trend', 
    () => dashboardApi.getSalesTrend(30).then(res => res.data),
    { retry: 1, refetchOnWindowFocus: false }
  );
  
  const { data: topProducts } = useQuery('top-products', 
    () => dashboardApi.getTopProducts(5).then(res => res.data),
    { retry: 1, refetchOnWindowFocus: false }
  );

  const statsCards = [
    {
      title: 'Total Sales',
      value: stats?.total_sales || 0,
      prefix: '₹',
      icon: <DollarOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Total Purchases',
      value: stats?.total_purchases || 0,
      prefix: '₹',
      icon: <ShoppingOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Pending Debts',
      value: stats?.total_debts || 0,
      prefix: '₹',
      icon: <CreditCardOutlined />,
      color: '#ff4d4f',
    },
    {
      title: 'Total Products',
      value: stats?.total_products || 0,
      icon: <DatabaseOutlined />,
      color: '#722ed1',
    },
  ];

  const chartData = salesTrend ? Object.entries(salesTrend).map(([date, data]: [string, any]) => ({
    date: date.slice(-5), // Show only MM-DD format
    sales: data.total || 0,
    paid: data.paid || 0,
  })) : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="card-shadow">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={{ color: stat.color }}
                suffix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Sales Trend (Last 30 Days)" className="card-shadow">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Line type="monotone" dataKey="sales" stroke="#1890ff" name="Total Sales" />
                <Line type="monotone" dataKey="paid" stroke="#52c41a" name="Paid Sales" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Top Selling Products" className="card-shadow">
            <List
              dataSource={topProducts?.data || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={
                      <div>
                        <Tag color="blue">{item.type}</Tag>
                        <span className="text-sm text-gray-500">
                          Qty: {item.total_quantity}
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Recent Sales" className="card-shadow">
            <List
              dataSource={stats?.recent_sales?.slice(0, 5) || []}
              renderItem={(sale: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={sale.customer_name}
                    description={
                      <div className="flex justify-between">
                        <span>₹{sale.total_amount}</span>
                        <Tag color={sale.payment_status === 'paid' ? 'green' : 'orange'}>
                          {sale.payment_status}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Recent Purchases" className="card-shadow">
            <List
              dataSource={stats?.recent_purchases?.slice(0, 5) || []}
              renderItem={(purchase: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={purchase.supplier_name}
                    description={
                      <div className="flex justify-between">
                        <span>₹{purchase.total_amount}</span>
                        <Tag color={purchase.payment_status === 'paid' ? 'green' : 'orange'}>
                          {purchase.payment_status}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Pending Debts" className="card-shadow">
            <List
              dataSource={stats?.pending_debts?.slice(0, 5) || []}
              renderItem={(debt: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={debt.customer_name}
                    description={
                      <div className="flex justify-between">
                        <span>₹{debt.amount}</span>
                        <Tag color={debt.is_overdue ? 'red' : 'orange'}>
                          {debt.is_overdue ? 'Overdue' : 'Pending'}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {(stats?.low_stock_products || 0) > 0 && (
        <Card className="card-shadow border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-3">
            <WarningOutlined className="text-orange-500 text-xl" />
            <div>
              <h4 className="text-orange-800 font-medium m-0">Low Stock Alert</h4>
              <p className="text-orange-600 text-sm m-0">
                {stats?.low_stock_products || 0} products are running low on stock
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
