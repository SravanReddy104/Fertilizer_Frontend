export interface Product {
  id: number;
  name: string;
  type: 'fertilizer' | 'pesticide' | 'seed';
  brand: string;
  unit: string;
  price_per_unit: number;
  stock_quantity: number;
  minimum_stock: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface Sale {
  id: number;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  total_amount: number;
  paid_amount: number;
  payment_status: 'paid' | 'pending' | 'partial' | 'overdue';
  notes?: string;
  sale_date: string;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface Purchase {
  id: number;
  supplier_name: string;
  supplier_phone?: string;
  supplier_address?: string;
  total_amount: number;
  paid_amount: number;
  payment_status: 'paid' | 'pending' | 'partial' | 'overdue';
  notes?: string;
  purchase_date: string;
  items: PurchaseItem[];
  created_at: string;
  updated_at: string;
}

export interface Debt {
  id: number;
  customer_name: string;
  customer_phone?: string;
  amount: number;
  description: string;
  due_date?: string;
  status: 'paid' | 'pending' | 'partial' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_sales: number;
  total_purchases: number;
  total_debts: number;
  total_products: number;
  low_stock_products: number;
  recent_sales: Sale[];
  recent_purchases: Purchase[];
  pending_debts: Debt[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface GridColumn {
  field: string;
  headerName: string;
  width?: number;
  type?: 'text' | 'number' | 'date' | 'currency' | 'status';
  editable?: boolean;
  sortable?: boolean;
  filter?: boolean;
  cellRenderer?: string | ((params: any) => any);
  valueFormatter?: (params: any) => string;
  cellStyle?: any;
}

export interface GridAction {
  icon: string;
  tooltip: string;
  onClick: (data: any) => void;
  color?: string;
  disabled?: (data: any) => boolean;
}

export interface ExportOptions {
  filename: string;
  format: 'csv' | 'excel' | 'pdf';
  columns?: string[];
  title?: string;
}
