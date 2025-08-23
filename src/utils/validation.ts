import * as yup from 'yup';

// Product validation schema
export const productSchema = yup.object().shape({
  name: yup.string().required('Product name is required').min(2, 'Name must be at least 2 characters'),
  type: yup.string().required('Product type is required').oneOf(['fertilizer', 'pesticide', 'seed']),
  brand: yup.string().required('Brand is required').min(2, 'Brand must be at least 2 characters'),
  unit: yup.string().required('Unit is required'),
  price_per_unit: yup.number().required('Price is required').min(0.01, 'Price must be greater than 0'),
  stock_quantity: yup.number().required('Stock quantity is required').min(0, 'Stock cannot be negative'),
  minimum_stock: yup.number().required('Minimum stock is required').min(0, 'Minimum stock cannot be negative'),
  description: yup.string().optional(),
});

// Sale validation schema
export const saleSchema = yup.object().shape({
  customer_name: yup.string().required('Customer name is required').min(2, 'Name must be at least 2 characters'),
  customer_phone: yup.string().optional().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
  customer_address: yup.string().optional(),
  notes: yup.string().optional(),
});

// Purchase validation schema
export const purchaseSchema = yup.object().shape({
  supplier_name: yup.string().required('Supplier name is required').min(2, 'Name must be at least 2 characters'),
  supplier_phone: yup.string().optional().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
  supplier_address: yup.string().optional(),
  notes: yup.string().optional(),
});

// Debt validation schema
export const debtSchema = yup.object().shape({
  customer_name: yup.string().required('Customer name is required').min(2, 'Name must be at least 2 characters'),
  customer_phone: yup.string().optional().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
  amount: yup.number().required('Amount is required').min(0.01, 'Amount must be greater than 0'),
  description: yup.string().required('Description is required').min(5, 'Description must be at least 5 characters'),
  due_date: yup.date().optional().min(new Date(), 'Due date cannot be in the past'),
  status: yup.string().required('Status is required').oneOf(['pending', 'partial', 'paid', 'overdue']),
});

// Payment validation schema
export const paymentSchema = yup.object().shape({
  amount: yup.number().required('Payment amount is required').min(0.01, 'Amount must be greater than 0'),
});

// Sale/Purchase item validation
export const itemSchema = yup.object().shape({
  product_id: yup.number().required('Product is required').min(1, 'Please select a product'),
  quantity: yup.number().required('Quantity is required').min(0.01, 'Quantity must be greater than 0'),
  unit_price: yup.number().required('Unit price is required').min(0, 'Unit price cannot be negative'),
});

// Validation helper functions
export const validateForm = async (schema: yup.Schema, data: any) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

export const validateItems = (items: any[]) => {
  const errors: string[] = [];
  
  if (items.length === 0) {
    errors.push('At least one item is required');
  }
  
  items.forEach((item, index) => {
    if (!item.product_id || item.product_id <= 0) {
      errors.push(`Item ${index + 1}: Please select a product`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
    }
    if (item.unit_price < 0) {
      errors.push(`Item ${index + 1}: Unit price cannot be negative`);
    }
  });
  
  return errors;
};
