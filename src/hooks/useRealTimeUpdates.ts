import { useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { message } from 'antd';

interface UseRealTimeUpdatesProps {
  enabled?: boolean;
}

export const useRealTimeUpdates = ({ enabled = true }: UseRealTimeUpdatesProps = {}) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Poll for updates every 30 seconds
    const pollForUpdates = () => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries('dashboard-stats');
      queryClient.invalidateQueries('products');
      queryClient.invalidateQueries('sales');
      queryClient.invalidateQueries('purchases');
      queryClient.invalidateQueries('debts');
    };

    // Set up polling interval
    intervalRef.current = setInterval(pollForUpdates, 30000);

    // Also check for low stock products every minute
    const checkLowStock = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/low-stock/`);
        if (response.ok) {
          const lowStockProducts = await response.json();
          if (lowStockProducts.length > 0) {
            message.warning({
              content: `${lowStockProducts.length} products are running low on stock!`,
              duration: 5,
              key: 'low-stock-warning'
            });
          }
        }
      } catch (error) {
        console.error('Error checking low stock:', error);
      }
    };

    const lowStockInterval = setInterval(checkLowStock, 60000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(lowStockInterval);
    };
  }, [enabled, queryClient]);

  // Manual refresh function
  const refreshData = () => {
    queryClient.invalidateQueries();
    message.success('Data refreshed successfully');
  };

  return { refreshData };
};
