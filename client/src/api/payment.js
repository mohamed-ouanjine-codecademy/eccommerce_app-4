// /client/src/api/payment.js
import { useMutation } from '@tanstack/react-query';
import apiClient from './client';

export const usePayment = () => {
  return useMutation({
    mutationFn: async ({ amount, currency }) => {
      const { data } = await apiClient.post('/payment/process', {
        amount: amount.toFixed(2),
        currency
      });
      return data;
    },
    onError: (error) => {
      console.error('Payment processing failed:', error);
      throw new Error(error.response?.data?.error || 'Payment failed');
    }
  });
};