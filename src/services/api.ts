import axios from 'axios';
import { Product, Sale, Purchase, Debt, DashboardStats } from '@/types';

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Products API
export const productsApi = {
  getAll: (params?: { skip?: number; limit?: number; product_type?: string; search?: string }) =>
    api.get<Product[]>('/api/products', { params }),
  
  getById: (id: number) =>
    api.get<Product>(`/api/products/${id}`),
  
  create: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Product>('/api/products', product),
  
  update: (id: number, product: Partial<Product>) =>
    api.put<Product>(`/api/products/${id}`, product),
  
  delete: (id: number) =>
    api.delete(`/api/products/${id}`),
  
  getLowStock: () =>
    api.get<Product[]>('/api/products/low-stock/'),
  
  updateStock: (id: number, quantity: number, operation: 'add' | 'subtract') =>
    api.post(`/api/products/${id}/update-stock`, null, { params: { quantity, operation } }),
};

// Sales API
export const salesApi = {
  getAll: (params?: { 
    skip?: number; 
    limit?: number; 
    start_date?: string; 
    end_date?: string; 
    payment_status?: string; 
    customer_name?: string; 
  }) =>
    api.get<Sale[]>('/api/sales', { params }),
  
  getById: (id: number) =>
    api.get<Sale>(`/api/sales/${id}`),
  
  create: (sale: {
    customer_name: string;
    customer_phone?: string;
    customer_address?: string;
    notes?: string;
    items: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  }) =>
    api.post<Sale>('/api/sales', sale),
  
  updatePayment: (id: number, paid_amount: number) =>
    api.put(`/api/sales/${id}/payment`, null, { params: { paid_amount } }),
  
  delete: (id: number) =>
    api.delete(`/api/sales/${id}`),
  
  getDailyStats: (date?: string) =>
    api.get('/api/sales/stats/daily', { params: { date_filter: date } }),
};

// Purchases API
export const purchasesApi = {
  getAll: (params?: { 
    skip?: number; 
    limit?: number; 
    start_date?: string; 
    end_date?: string; 
    payment_status?: string; 
    supplier_name?: string; 
  }) =>
    api.get<Purchase[]>('/api/purchases', { params }),
  
  getById: (id: number) =>
    api.get<Purchase>(`/api/purchases/${id}`),
  
  create: (purchase: {
    supplier_name: string;
    supplier_phone?: string;
    supplier_address?: string;
    notes?: string;
    items: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  }) =>
    api.post<Purchase>('/api/purchases', purchase),
  
  updatePayment: (id: number, paid_amount: number) =>
    api.put(`/api/purchases/${id}/payment`, null, { params: { paid_amount } }),
  
  delete: (id: number) =>
    api.delete(`/api/purchases/${id}`),
  
  getDailyStats: (date?: string) =>
    api.get('/api/purchases/stats/daily', { params: { date_filter: date } }),
};

// Debts API
export const debtsApi = {
  getAll: (params?: { 
    skip?: number; 
    limit?: number; 
    status?: string; 
    customer_name?: string; 
    overdue_only?: boolean; 
  }) =>
    api.get<Debt[]>('/api/debts', { params }),
  
  getById: (id: number) =>
    api.get<Debt>(`/api/debts/${id}`),
  
  create: (debt: Omit<Debt, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Debt>('/api/debts', debt),
  
  update: (id: number, debt: Partial<Debt>) =>
    api.put<Debt>(`/api/debts/${id}`, debt),
  
  payDebt: (id: number, amount: number) =>
    api.put(`/api/debts/${id}/pay`, null, { params: { amount } }),
  
  delete: (id: number) =>
    api.delete(`/api/debts/${id}`),
  
  getSummary: () =>
    api.get('/api/debts/stats/summary'),
  
  markOverdue: () =>
    api.post('/api/debts/mark-overdue'),
};

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    api.get<DashboardStats>('/api/dashboard/stats'),
  
  getSalesTrend: (days?: number) =>
    api.get('/api/dashboard/sales-trend', { params: { days } }),
  
  getTopProducts: (limit?: number) =>
    api.get('/api/dashboard/top-products', { params: { limit } }),
  
  getMonthlySummary: (year?: number, month?: number) =>
    api.get('/api/dashboard/monthly-summary', { params: { year, month } }),
};

// Admin API
export const adminApi = {
  listUsers: () => api.get('/api/admin/users'),
  setRole: (userId: number, role: 'admin' | 'user') => api.patch(`/api/admin/users/${userId}/role`, { role }),
  setActive: (userId: number, is_active: boolean) => api.patch(`/api/admin/users/${userId}/active`, { is_active }),
  deleteUser: (userId: number) => api.delete(`/api/admin/users/${userId}`),
};

export default api;
