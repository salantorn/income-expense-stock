import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const code = error.response?.data?.error || 'UNKNOWN_ERROR';
    const status = error.response?.status;

    // Redirect to login on 401
    if (status === 401 && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }

    // Return structured error object
    return Promise.reject({ 
      message, 
      code, 
      status, 
      details: error.response?.data?.details,
      response: error.response // Keep original response for compatibility
    });
  }
);

export default api;

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  requestReset: (email: string) => api.post('/auth/request-reset', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),
  getMe: () => api.get('/auth/me'),
};

// ─── Transactions ──────────────────────────────────────────────────────────
export const transactionApi = {
  create: (data: any) => api.post('/transactions', data),
  getAll: (params?: any) => api.get('/transactions', { params }),
  getById: (id: string) => api.get(`/transactions/${id}`),
  update: (id: string, data: any) => api.put(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  getBalance: () => api.get('/transactions/balance'),
  getByCategory: () => api.get('/transactions/by-category'),
  getMonthlySummary: (year?: number) =>
    api.get('/transactions/monthly-summary', { params: { year } }),
};

// ─── Portfolio ─────────────────────────────────────────────────────────────
export const portfolioApi = {
  addPosition: (data: any) => api.post('/portfolio/positions', data),
  getPositions: () => api.get('/portfolio/positions'),
  getPositionById: (id: string) => api.get(`/portfolio/positions/${id}`),
  updatePosition: (id: string, data: any) => api.put(`/portfolio/positions/${id}`, data),
  deletePosition: (id: string) => api.delete(`/portfolio/positions/${id}`),
  getValue: () => api.get('/portfolio/value'),
  getPrices: (symbols: string[]) =>
    api.get('/portfolio/prices', { params: { symbols: symbols.join(',') } }),
  search: (q: string) => api.get('/portfolio/search', { params: { q } }),
  getHistory: (symbol: string, timeframe: string) => api.get(`/portfolio/history/${symbol}`, { params: { timeframe } }),
};
