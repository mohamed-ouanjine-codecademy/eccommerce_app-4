// client/src/api/orders.js
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { QueryKeys } from '../lib/react-query';
import { queryClient } from '../lib/react-query';

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (orderData) => apiClient.post('/orders', orderData),
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.ORDERS]);
      queryClient.removeQueries([QueryKeys.CART]);
    }
  });
};

export const useOrderHistory = () => {
  return useQuery({
    queryKey: [QueryKeys.ORDERS],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders');
      return data;
    },
    staleTime: 300000 // 5 minutes
  });
};

export const useOrderDetails = (id) => {
  return useQuery({
    queryKey: [QueryKeys.ORDERS, id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/orders/${id}`, {
        version: 1
      });
      return data;
    },
    enabled: !!id,
    staleTime: 300000 // 5 minutes
  });
};

export const useOrderStatus = (id) => {
  return useQuery({
    queryKey: [QueryKeys.ORDERS, id, 'status'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/orders/${id}/status`);
      return data.status;
    },
    enabled: !!id,
    refetchInterval: 60000 // 1 minute
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => 
      apiClient.put(`/orders/${orderId}/cancel`),
    onMutate: async (orderId) => {
      await queryClient.cancelQueries([QueryKeys.ORDERS, orderId]);
      
      const previousOrder = queryClient.getQueryData([QueryKeys.ORDERS, orderId]);
      
      queryClient.setQueryData([QueryKeys.ORDERS, orderId], old => ({
        ...old,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      }));

      return { previousOrder };
    },
    onError: (error, orderId, context) => {
      queryClient.setQueryData([QueryKeys.ORDERS, orderId], context.previousOrder);
    },
    onSettled: () => {
      queryClient.invalidateQueries([QueryKeys.ORDERS]);
    }
  });
};