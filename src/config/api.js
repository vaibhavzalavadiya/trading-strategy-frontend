export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://trading-strategy-backend-gxl8.onrender.com';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  return response;
};