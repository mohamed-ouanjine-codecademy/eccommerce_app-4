// /client/src/api/cart.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { QueryKeys } from '../lib/react-query';

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity }) => 
      apiClient.post('/cart', { productId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.CART]);
    }
  });
};

export const useCart = () => {
  return useQuery({
    queryKey: [QueryKeys.CART],
    queryFn: async () => {
      const { data } = await apiClient.get('/cart');
      return data;
    },
    staleTime: 300000 // 5 minutes
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity }) => 
      apiClient.patch(`/cart/${productId}`, { quantity }),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries([QueryKeys.CART]);
      
      const previousCart = queryClient.getQueryData([QueryKeys.CART]);
      
      queryClient.setQueryData([QueryKeys.CART], old => ({
        ...old,
        items: old.items.map(item => 
          item.product._id === productId 
            ? { ...item, quantity } 
            : item
        )
      }));
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([QueryKeys.CART], context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries([QueryKeys.CART]);
    }
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId) => apiClient.delete(`/cart/${productId}`),
    onMutate: async (productId) => {
      await queryClient.cancelQueries([QueryKeys.CART]);
      
      const previousCart = queryClient.getQueryData([QueryKeys.CART]);
      
      queryClient.setQueryData([QueryKeys.CART], old => ({
        ...old,
        items: old.items.filter(item => item.product._id !== productId)
      }));
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([QueryKeys.CART], context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries([QueryKeys.CART]);
    }
  });
};