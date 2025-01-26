import apiClient from "./client";

export const renewAuthToken = async () => {
  try {
    const { data } = await apiClient.post('/auth/refresh');
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  } catch (error) {
    throw error; // Trigger logout
  }
};