import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, InputNumber, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productsApi } from '@/services/api';
import { Product, GridColumn, GridAction } from '@/types';
import DataGrid from '@/components/DataGrid/DataGrid';

const { Option } = Select;

const Products: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: products, isLoading, refetch } = useQuery('products', () => 
    productsApi.getAll().then(res => res.data)
  );

  const createMutation = useMutation(productsApi.create, {
    onSuccess: () => {
      message.success('Product created successfully');
      queryClient.invalidateQueries('products');
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create product');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<Product> }) => 
      productsApi.update(id, data),
    {
      onSuccess: () => {
        message.success('Product updated successfully');
        queryClient.invalidateQueries('products');
        setIsModalVisible(false);
        setEditingProduct(null);
        form.resetFields();
      },
      onError: () => {
        message.error('Failed to update product');
      }
    }
  );

  const deleteMutation = useMutation(productsApi.delete, {
    onSuccess: () => {
      message.success('Product deleted successfully');
      queryClient.invalidateQueries('products');
    },
    onError: () => {
      message.error('Failed to delete product');
    }
  });

  const columns: GridColumn[] = [
    { field: 'name', headerName: 'Product Name', width: 200 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'brand', headerName: 'Brand', width: 150 },
    { field: 'unit', headerName: 'Unit', width: 100 },
    { field: 'price_per_unit', headerName: 'Price/Unit', width: 120, type: 'currency' },
    { field: 'stock_quantity', headerName: 'Stock', width: 100, type: 'number' },
    { field: 'minimum_stock', headerName: 'Min Stock', width: 100, type: 'number' },
    { field: 'created_at', headerName: 'Created', width: 120, type: 'date' },
  ];

  const actions: GridAction[] = [
    {
      icon: 'edit',
      tooltip: 'Edit Product',
      onClick: (data: Product) => handleEdit(data),
      color: '#1890ff'
    },
    {
      icon: 'delete',
      tooltip: 'Delete Product',
      onClick: (data: Product) => handleDelete(data),
      color: '#ff4d4f'
    }
  ];

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleDelete = (product: Product) => {
    Modal.confirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete "${product.name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(product.id),
    });
  };

  const handleSubmit = (values: any) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-800">Products Management</h2>
            <p className="text-gray-600">Manage fertilizers, pesticides, and seeds inventory</p>
          </div>
          <div className="flex-shrink-0">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Add Product
          </Button>
          </div>
        </div>

        <DataGrid
          data={products || []}
          columns={columns}
          actions={actions}
          loading={isLoading}
          onRefresh={refetch}
          enableExport={true}
          enableSearch={true}
          enableFilter={true}
          exportOptions={{
            filename: 'products',
            title: 'Products List'
          }}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
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
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Product Type"
            rules={[{ required: true, message: 'Please select product type' }]}
          >
            <Select placeholder="Select product type">
              <Option value="fertilizer">Fertilizer</Option>
              <Option value="pesticide">Pesticide</Option>
              <Option value="seed">Seed</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="brand"
            label="Brand"
            rules={[{ required: true, message: 'Please enter brand name' }]}
          >
            <Input placeholder="Enter brand name" />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unit"
            rules={[{ required: true, message: 'Please enter unit' }]}
          >
            <Input placeholder="e.g., kg, liter, packet" />
          </Form.Item>

          <Form.Item
            name="price_per_unit"
            label="Price per Unit (₹)"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Enter price"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="stock_quantity"
            label="Stock Quantity"
            rules={[{ required: true, message: 'Please enter stock quantity' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Enter stock quantity"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="minimum_stock"
            label="Minimum Stock Level"
            rules={[{ required: true, message: 'Please enter minimum stock level' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Enter minimum stock level"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter product description (optional)"
            />
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
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
