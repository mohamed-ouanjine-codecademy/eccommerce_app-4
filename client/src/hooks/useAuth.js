// /client/src/hooks/userAuth.js
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '../lib/react-query';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const initializeAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const { data: user } = await axios.get('/auth/profile');
      setUser(user);
      setIsLoggedIn(true);
    } catch (err) {
      localStorage.removeItem('accessToken');
      queryClient.removeQueries();
    }
  };

  return {
    initializeAuth,
    refreshAuth: () => queryClient.invalidateQueries([QueryKeys.USER_PROFILE])
  };
};