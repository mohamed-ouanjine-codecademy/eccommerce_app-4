// /client/src/api/products.js
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from './client';
import { QueryKeys } from '../lib/react-query';
import { queryClient } from '../lib/react-query';

const productAPI = {
  getProducts: async (params) => {
    const { data } = await apiClient.get('/products', { params });
    return data;
  },

  getProductDetails: async (id) => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  createProduct: async (productData) => {
    const { data } = await apiClient.post('/admin/products', productData);
    return data;
  },

};

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: [QueryKeys.PRODUCTS, params],
    queryFn: () => productAPI.getProducts(params)
    // Remove select function
  });
};

export const useProductDetails = (id) => {
  return useQuery({
    queryKey: [QueryKeys.PRODUCTS, id],
    queryFn: () => productAPI.getProductDetails(id),
    enabled: !!id,
    staleTime: 300000 // 5 minutes cache
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: productAPI.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.PRODUCTS]);
    }
  });
};

