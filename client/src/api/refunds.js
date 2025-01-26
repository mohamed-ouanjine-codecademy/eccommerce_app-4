// /client/src/api/refunds.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { QueryKeys } from '../lib/react-query';

export const useRequestRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, reason, amount }) =>
      apiClient.post(`/orders/${orderId}/refunds`, { reason, amount }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([QueryKeys.ORDERS, variables.orderId]);
      queryClient.invalidateQueries([QueryKeys.REFUNDS]);
    }
  });
};

export const useRefundHistory = (userId) => {
  return useQuery({
    queryKey: [QueryKeys.REFUNDS, userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/${userId}/refunds`);
      return data;
    },
    enabled: !!userId
  });
};