// /client/src/lib/react-query.js
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      retry: (failureCount, error) => {
        if (error.statusCode === 404) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false
    },
    mutations: {
      onError: (error) => {
        toast.error(error.message || 'Action failed');
      }
    }
  }
});

export const QueryKeys = {
  PRODUCTS: 'products',
  CART: 'cart',
  ORDERS: 'orders',
  USERS: 'users',
  ANALYTICS: 'analytics',
  REFUNDS: 'refunds'
};