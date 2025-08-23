import React from 'react';

interface CurrencyCellRendererProps {
  value: number;
  currency?: string;
}

const CurrencyCellRenderer: React.FC<CurrencyCellRendererProps> = ({ 
  value, 
  currency = '₹' 
}) => {
  const formatCurrency = (amount: number) => {
    if (amount == null || isNaN(amount)) return `${currency}0.00`;
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <span className="font-medium text-gray-900">
      {formatCurrency(value)}
    </span>
  );
};

export default CurrencyCellRenderer;
