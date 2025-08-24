import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, InputNumber, message, Space, Table, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { salesApi, productsApi } from '@/services/api';
import { Sale, GridColumn, GridAction, SaleItem } from '@/types';
import DataGrid from '@/components/DataGrid/DataGrid';

const { Option } = Select;

const Sales: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: sales, isLoading, refetch } = useQuery('sales', () => 
    salesApi.getAll().then(res => res.data)
  );

  const { data: products } = useQuery('products', () => 
    productsApi.getAll().then(res => res.data)
  );

  const createMutation = useMutation(salesApi.create, {
    onSuccess: () => {
      message.success('Sale created successfully');
      queryClient.invalidateQueries(['sales', 'products', 'dashboard-stats']);
      setIsModalVisible(false);
      form.resetFields();
      setSaleItems([]);
    },
    onError: () => {
      message.error('Failed to create sale');
    }
  });

  const paymentMutation = useMutation(
    ({ id, amount }: { id: number; amount: number }) => 
      salesApi.updatePayment(id, amount),
    {
      onSuccess: () => {
        message.success('Payment updated successfully');
        queryClient.invalidateQueries(['sales', 'dashboard-stats']);
        setIsPaymentModalVisible(false);
        paymentForm.resetFields();
      },
      onError: () => {
        message.error('Failed to update payment');
      }
    }
  );

  const deleteMutation = useMutation(salesApi.delete, {
    onSuccess: () => {
      message.success('Sale deleted successfully');
      queryClient.invalidateQueries(['sales', 'products', 'dashboard-stats']);
    },
    onError: () => {
      message.error('Failed to delete sale');
    }
  });

  const columns: GridColumn[] = [
    { field: 'customer_name', headerName: 'Customer', width: 180 },
    { field: 'customer_phone', headerName: 'Phone', width: 130 },
    { field: 'total_amount', headerName: 'Total Amount', width: 130, type: 'currency' },
    { field: 'paid_amount', headerName: 'Paid Amount', width: 130, type: 'currency' },
    { field: 'payment_status', headerName: 'Status', width: 120, type: 'status' },
    { field: 'sale_date', headerName: 'Sale Date', width: 120, type: 'date' },
  ];

  const actions: GridAction[] = [
    {
      icon: 'payment',
      tooltip: 'Update Payment',
      onClick: (data: Sale) => handlePayment(data),
      color: '#52c41a',
      disabled: (data: Sale) => data.payment_status === 'paid'
    },
    {
      icon: 'delete',
      tooltip: 'Delete Sale',
      onClick: (data: Sale) => handleDelete(data),
      color: '#ff4d4f'
    }
  ];

  const handleAdd = () => {
    form.resetFields();
    setSaleItems([]);
    setIsModalVisible(true);
  };

  const handlePayment = (sale: Sale) => {
    setSelectedSale(sale);
    paymentForm.resetFields();
    setIsPaymentModalVisible(true);
  };

  const handleDelete = (sale: Sale) => {
    Modal.confirm({
      title: 'Delete Sale',
      content: `Are you sure you want to delete sale for "${sale.customer_name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(sale.id),
    });
  };

  const addSaleItem = () => {
    const newItem: SaleItem = {
      product_id: 0,
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setSaleItems([...saleItems, newItem]);
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    const updatedItems = [...saleItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'product_id') {
      const product = products?.find(p => p.id === value);
      if (product) {
        updatedItems[index].unit_price = product.price_per_unit;
        updatedItems[index].total_price = updatedItems[index].quantity * product.price_per_unit;
      }
    }
    
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setSaleItems(updatedItems);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (values: any) => {
    if (saleItems.length === 0) {
      message.error('Please add at least one item');
      return;
    }

    const saleData = {
      ...values,
      items: saleItems.filter(item => item.product_id > 0)
    };

    createMutation.mutate(saleData);
  };

  const handlePaymentSubmit = (values: any) => {
    if (selectedSale) {
      paymentMutation.mutate({
        id: selectedSale.id,
        amount: values.amount
      });
    }
  };

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'product_id',
      render: (value: number, _record: SaleItem, index: number) => (
        <Select
          value={value || undefined}
          placeholder="Select product"
          style={{ width: '100%' }}
          onChange={(val) => updateSaleItem(index, 'product_id', val)}
        >
          {products?.map(product => (
            <Option key={product.id} value={product.id}>
              {product.name} ({product.brand})
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (value: number, _record: SaleItem, index: number) => (
        <InputNumber
          value={value}
          min={0.01}
          step={0.01}
          onChange={(val) => updateSaleItem(index, 'quantity', val || 0)}
        />
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      render: (value: number, _record: SaleItem, index: number) => (
        <InputNumber
          value={value}
          min={0}
          step={0.01}
          prefix="₹"
          onChange={(val) => updateSaleItem(index, 'unit_price', val || 0)}
        />
      )
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      render: (value: number) => `₹${value.toFixed(2)}`
    },
    {
      title: 'Action',
      render: (_text: any, _record: SaleItem, index: number) => (
        <Button 
          type="text" 
          danger 
          onClick={() => removeSaleItem(index)}
          icon={<DeleteOutlined />}
        />
      )
    }
  ];

  const totalAmount = saleItems.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-800">Sales Management</h2>
            <p className="text-gray-600">Track and manage customer sales</p>
          </div>
          <div className="flex-shrink-0">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            New Sale
          </Button>
          </div>
        </div>

        <DataGrid
          data={sales || []}
          columns={columns}
          actions={actions}
          loading={isLoading}
          onRefresh={refetch}
          enableExport={true}
          enableSearch={true}
          enableFilter={true}
          exportOptions={{
            filename: 'sales',
            title: 'Sales Report'
          }}
        />
      </Card>

      {/* Add Sale Modal */}
      <Modal
        title="Create New Sale"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="customer_name"
              label="Customer Name"
              rules={[{ required: true, message: 'Please enter customer name' }]}
            >
              <Input placeholder="Enter customer name" />
            </Form.Item>

            <Form.Item
              name="customer_phone"
              label="Customer Phone"
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </div>

          <Form.Item
            name="customer_address"
            label="Customer Address"
          >
            <Input.TextArea rows={2} placeholder="Enter customer address" />
          </Form.Item>

          <Divider>Sale Items</Divider>

          <div className="mb-4">
            <Button type="dashed" onClick={addSaleItem} block>
              Add Item
            </Button>
          </div>

          <Table
            dataSource={saleItems}
            columns={itemColumns}
            pagination={false}
            rowKey={(_record, index) => index!}
            size="small"
          />

          <div className="mt-4 text-right">
            <h3>Total Amount: ₹{totalAmount.toFixed(2)}</h3>
          </div>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={2} placeholder="Additional notes (optional)" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createMutation.isLoading}
              >
                Create Sale
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Update Payment"
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
        width={400}
      >
        {selectedSale && (
          <div className="mb-4">
            <p><strong>Customer:</strong> {selectedSale.customer_name}</p>
            <p><strong>Total Amount:</strong> ₹{selectedSale.total_amount}</p>
            <p><strong>Paid Amount:</strong> ₹{selectedSale.paid_amount}</p>
            <p><strong>Remaining:</strong> ₹{selectedSale.total_amount - selectedSale.paid_amount}</p>
          </div>
        )}

        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePaymentSubmit}
        >
          <Form.Item
            name="amount"
            label="Payment Amount"
            rules={[{ required: true, message: 'Please enter payment amount' }]}
          >
            <InputNumber
              min={0}
              max={selectedSale ? selectedSale.total_amount - selectedSale.paid_amount : undefined}
              step={0.01}
              prefix="₹"
              placeholder="Enter payment amount"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsPaymentModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={paymentMutation.isLoading}
              >
                Update Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sales;
