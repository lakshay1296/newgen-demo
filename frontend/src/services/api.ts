import axios, { AxiosRequestConfig } from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) => 
    api.post('/auth/register', userData),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (userData: any) => 
    api.put('/auth/profile', userData),
};

// Customer API
export const customerAPI = {
  getAll: (params?: any) => 
    api.get('/customers', { params }),
  
  getById: (id: number) => 
    api.get(`/customers/${id}`),
  
  create: (customerData: any) => 
    api.post('/customers', customerData),
  
  update: (id: number, customerData: any) => 
    api.put(`/customers/${id}`, customerData),
  
  delete: (id: number) => 
    api.delete(`/customers/${id}`),
};

// Product API
export const productAPI = {
  getAll: (params?: any) => 
    api.get('/products', { params }),
  
  getById: (id: number) => 
    api.get(`/products/${id}`),
  
  getCategories: () => 
    api.get('/products/categories'),
  
  create: (productData: any) => 
    api.post('/products', productData),
  
  update: (id: number, productData: any) => 
    api.put(`/products/${id}`, productData),
  
  delete: (id: number) => 
    api.delete(`/products/${id}`),
  
  updateStock: (id: number, quantity: number) => 
    api.patch(`/products/${id}/stock`, { quantity }),
};

// Order API
export const orderAPI = {
  getAll: (params?: any) => 
    api.get('/orders', { params }),
  
  getById: (id: number) => 
    api.get(`/orders/${id}`),
  
  getCustomerOrders: (customerId: number, params?: any) => 
    api.get(`/orders/customer/${customerId}`, { params }),
  
  getStatistics: (params?: any) => 
    api.get('/orders/statistics', { params }),
  
  create: (orderData: any) => 
    api.post('/orders', orderData),
  
  update: (id: number, orderData: any) => 
    api.put(`/orders/${id}`, orderData),
  
  cancel: (id: number, notes?: string) =>
    api.post(`/orders/${id}/cancel`, { notes }),
};

// Settings API
export const settingsAPI = {
  getSettings: () =>
    api.get('/settings'),
  
  updateSettings: (settingsData: any) =>
    api.put('/settings', settingsData),
  
  resetSettings: () =>
    api.post('/settings/reset'),
};

export default api;