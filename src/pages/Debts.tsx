import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PaymentOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { debtsApi } from '@/services/api';
import { Debt, GridColumn, GridAction } from '@/types';
import DataGrid from '@/components/DataGrid/DataGrid';
import dayjs from 'dayjs';

const { Option } = Select;

const Debts: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: debts, isLoading, refetch } = useQuery('debts', () => 
    debtsApi.getAll().then(res => res.data)
  );

  const createMutation = useMutation(debtsApi.create, {
    onSuccess: () => {
      message.success('Debt record created successfully');
      queryClient.invalidateQueries(['debts', 'dashboard-stats']);
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create debt record');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<Debt> }) => 
      debtsApi.update(id, data),
    {
      onSuccess: () => {
        message.success('Debt record updated successfully');
        queryClient.invalidateQueries(['debts', 'dashboard-stats']);
        setIsModalVisible(false);
        setEditingDebt(null);
        form.resetFields();
      },
      onError: () => {
        message.error('Failed to update debt record');
      }
    }
  );

  const paymentMutation = useMutation(
    ({ id, amount }: { id: number; amount: number }) => 
      debtsApi.payDebt(id, amount),
    {
      onSuccess: () => {
        message.success('Payment recorded successfully');
        queryClient.invalidateQueries(['debts', 'dashboard-stats']);
        setIsPaymentModalVisible(false);
        paymentForm.resetFields();
      },
      onError: () => {
        message.error('Failed to record payment');
      }
    }
  );

  const deleteMutation = useMutation(debtsApi.delete, {
    onSuccess: () => {
      message.success('Debt record deleted successfully');
      queryClient.invalidateQueries(['debts', 'dashboard-stats']);
    },
    onError: () => {
      message.error('Failed to delete debt record');
    }
  });

  const columns: GridColumn[] = [
    { field: 'customer_name', headerName: 'Customer', width: 180 },
    { field: 'customer_phone', headerName: 'Phone', width: 130 },
    { field: 'amount', headerName: 'Amount', width: 120, type: 'currency' },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'due_date', headerName: 'Due Date', width: 120, type: 'date' },
    { field: 'status', headerName: 'Status', width: 120, type: 'status' },
    { field: 'created_at', headerName: 'Created', width: 120, type: 'date' },
  ];

  const actions: GridAction[] = [
    {
      icon: 'payment',
      tooltip: 'Record Payment',
      onClick: (data: Debt) => handlePayment(data),
      color: '#52c41a',
      disabled: (data: Debt) => data.status === 'paid'
    },
    {
      icon: 'edit',
      tooltip: 'Edit Debt',
      onClick: (data: Debt) => handleEdit(data),
      color: '#1890ff'
    },
    {
      icon: 'delete',
      tooltip: 'Delete Debt',
      onClick: (data: Debt) => handleDelete(data),
      color: '#ff4d4f'
    }
  ];

  const handleAdd = () => {
    setEditingDebt(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    form.setFieldsValue({
      ...debt,
      due_date: debt.due_date ? dayjs(debt.due_date) : null
    });
    setIsModalVisible(true);
  };

  const handlePayment = (debt: Debt) => {
    setSelectedDebt(debt);
    paymentForm.resetFields();
    setIsPaymentModalVisible(true);
  };

  const handleDelete = (debt: Debt) => {
    Modal.confirm({
      title: 'Delete Debt Record',
      content: `Are you sure you want to delete debt record for "${debt.customer_name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(debt.id),
    });
  };

  const handleSubmit = (values: any) => {
    const formData = {
      ...values,
      due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null
    };

    if (editingDebt) {
      updateMutation.mutate({ id: editingDebt.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePaymentSubmit = (values: any) => {
    if (selectedDebt) {
      paymentMutation.mutate({
        id: selectedDebt.id,
        amount: values.amount
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingDebt(null);
    form.resetFields();
  };

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Debts Management</h2>
            <p className="text-gray-600">Track and manage customer debts and payments</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Add Debt Record
          </Button>
        </div>

        <DataGrid
          data={debts || []}
          columns={columns}
          actions={actions}
          loading={isLoading}
          onRefresh={refetch}
          enableExport={true}
          enableSearch={true}
          enableFilter={true}
          exportOptions={{
            filename: 'debts',
            title: 'Debts Report'
          }}
        />
      </Card>

      {/* Add/Edit Debt Modal */}
      <Modal
        title={editingDebt ? 'Edit Debt Record' : 'Add New Debt Record'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
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

          <Form.Item
            name="amount"
            label="Debt Amount (₹)"
            rules={[{ required: true, message: 'Please enter debt amount' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Enter debt amount"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter description of the debt"
            />
          </Form.Item>

          <Form.Item
            name="due_date"
            label="Due Date"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Select due date"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="partial">Partial</Option>
              <Option value="paid">Paid</Option>
              <Option value="overdue">Overdue</Option>
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
                loading={createMutation.isLoading || updateMutation.isLoading}
              >
                {editingDebt ? 'Update' : 'Create'} Debt Record
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Record Payment"
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
        width={400}
      >
        {selectedDebt && (
          <div className="mb-4">
            <p><strong>Customer:</strong> {selectedDebt.customer_name}</p>
            <p><strong>Current Debt:</strong> ₹{selectedDebt.amount}</p>
            <p><strong>Description:</strong> {selectedDebt.description}</p>
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
              max={selectedDebt?.amount}
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
                Record Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Debts;
