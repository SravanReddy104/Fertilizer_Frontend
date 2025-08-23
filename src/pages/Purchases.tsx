import  { useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, InputNumber, message, Space, Table, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { purchasesApi, productsApi } from '@/services/api';
import { Purchase, GridColumn, GridAction, PurchaseItem } from '@/types';
import DataGrid from '@/components/DataGrid/DataGrid';

const { Option } = Select;

const Purchases: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: purchases, isLoading, refetch } = useQuery('purchases', () => 
    purchasesApi.getAll().then(res => res.data)
  );

  const { data: products } = useQuery('products', () => 
    productsApi.getAll().then(res => res.data)
  );

  const createMutation = useMutation(purchasesApi.create, {
    onSuccess: () => {
      message.success('Purchase created successfully');
      queryClient.invalidateQueries(['purchases', 'products', 'dashboard-stats']);
      setIsModalVisible(false);
      form.resetFields();
      setPurchaseItems([]);
    },
    onError: () => {
      message.error('Failed to create purchase');
    }
  });

  const paymentMutation = useMutation(
    ({ id, amount }: { id: number; amount: number }) => 
      purchasesApi.updatePayment(id, amount),
    {
      onSuccess: () => {
        message.success('Payment updated successfully');
        queryClient.invalidateQueries(['purchases', 'dashboard-stats']);
        setIsPaymentModalVisible(false);
        paymentForm.resetFields();
      },
      onError: () => {
        message.error('Failed to update payment');
      }
    }
  );

  const deleteMutation = useMutation(purchasesApi.delete, {
    onSuccess: () => {
      message.success('Purchase deleted successfully');
      queryClient.invalidateQueries(['purchases', 'products', 'dashboard-stats']);
    },
    onError: () => {
      message.error('Failed to delete purchase');
    }
  });

  const columns: GridColumn[] = [
    { field: 'supplier_name', headerName: 'Supplier', width: 180 },
    { field: 'supplier_phone', headerName: 'Phone', width: 130 },
    { field: 'total_amount', headerName: 'Total Amount', width: 130, type: 'currency' },
    { field: 'paid_amount', headerName: 'Paid Amount', width: 130, type: 'currency' },
    { field: 'payment_status', headerName: 'Status', width: 120, type: 'status' },
    { field: 'purchase_date', headerName: 'Purchase Date', width: 120, type: 'date' },
  ];

  const actions: GridAction[] = [
    {
      icon: 'payment',
      tooltip: 'Update Payment',
      onClick: (data: Purchase) => handlePayment(data),
      color: '#52c41a',
      disabled: (data: Purchase) => data.payment_status === 'paid'
    },
    {
      icon: 'delete',
      tooltip: 'Delete Purchase',
      onClick: (data: Purchase) => handleDelete(data),
      color: '#ff4d4f'
    }
  ];

  const handleAdd = () => {
    form.resetFields();
    setPurchaseItems([]);
    setIsModalVisible(true);
  };

  const handlePayment = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    paymentForm.resetFields();
    setIsPaymentModalVisible(true);
  };

  const handleDelete = (purchase: Purchase) => {
    Modal.confirm({
      title: 'Delete Purchase',
      content: `Are you sure you want to delete purchase from "${purchase.supplier_name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(purchase.id),
    });
  };

  const addPurchaseItem = () => {
    const newItem: PurchaseItem = {
      product_id: 0,
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setPurchaseItems([...purchaseItems, newItem]);
  };

  const updatePurchaseItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...purchaseItems];
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
    
    setPurchaseItems(updatedItems);
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (values: any) => {
    if (purchaseItems.length === 0) {
      message.error('Please add at least one item');
      return;
    }

    const purchaseData = {
      ...values,
      items: purchaseItems.filter(item => item.product_id > 0)
    };

    createMutation.mutate(purchaseData);
  };

  const handlePaymentSubmit = (values: any) => {
    if (selectedPurchase) {
      paymentMutation.mutate({
        id: selectedPurchase.id,
        amount: values.amount
      });
    }
  };

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'product_id',
      render: (value: number, record: PurchaseItem, index: number) => (
        <Select
          value={value || undefined}
          placeholder="Select product"
          style={{ width: '100%' }}
          onChange={(val) => updatePurchaseItem(index, 'product_id', val)}
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
      render: (value: number, record: PurchaseItem, index: number) => (
        <InputNumber
          value={value}
          min={0.01}
          step={0.01}
          onChange={(val) => updatePurchaseItem(index, 'quantity', val || 0)}
        />
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      render: (value: number, record: PurchaseItem, index: number) => (
        <InputNumber
          value={value}
          min={0}
          step={0.01}
          prefix="₹"
          onChange={(val) => updatePurchaseItem(index, 'unit_price', val || 0)}
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
      render: (text: any, record: PurchaseItem, index: number) => (
        <Button 
          type="text" 
          danger 
          onClick={() => removePurchaseItem(index)}
          icon={<DeleteOutlined />}
        />
      )
    }
  ];

  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Purchases Management</h2>
            <p className="text-gray-600">Track and manage supplier purchases</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            New Purchase
          </Button>
        </div>

        <DataGrid
          data={purchases || []}
          columns={columns}
          actions={actions}
          loading={isLoading}
          onRefresh={refetch}
          enableExport={true}
          enableSearch={true}
          enableFilter={true}
          exportOptions={{
            filename: 'purchases',
            title: 'Purchases Report'
          }}
        />
      </Card>

      {/* Add Purchase Modal */}
      <Modal
        title="Create New Purchase"
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
              name="supplier_name"
              label="Supplier Name"
              rules={[{ required: true, message: 'Please enter supplier name' }]}
            >
              <Input placeholder="Enter supplier name" />
            </Form.Item>

            <Form.Item
              name="supplier_phone"
              label="Supplier Phone"
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </div>

          <Form.Item
            name="supplier_address"
            label="Supplier Address"
          >
            <Input.TextArea rows={2} placeholder="Enter supplier address" />
          </Form.Item>

          <Divider>Purchase Items</Divider>

          <div className="mb-4">
            <Button type="dashed" onClick={addPurchaseItem} block>
              Add Item
            </Button>
          </div>

          <Table
            dataSource={purchaseItems}
            columns={itemColumns}
            pagination={false}
            rowKey={(record, index) => index!}
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
                Create Purchase
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
        {selectedPurchase && (
          <div className="mb-4">
            <p><strong>Supplier:</strong> {selectedPurchase.supplier_name}</p>
            <p><strong>Total Amount:</strong> ₹{selectedPurchase.total_amount}</p>
            <p><strong>Paid Amount:</strong> ₹{selectedPurchase.paid_amount}</p>
            <p><strong>Remaining:</strong> ₹{selectedPurchase.total_amount - selectedPurchase.paid_amount}</p>
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
              max={selectedPurchase ? selectedPurchase.total_amount - selectedPurchase.paid_amount : undefined}
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

export default Purchases;
