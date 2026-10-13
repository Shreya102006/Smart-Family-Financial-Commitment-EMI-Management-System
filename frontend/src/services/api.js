import axios from 'axios';

// Dynamic backend API base URL with fallback to local port 8083 or 8080
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';
const cleanBaseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: cleanBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
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

// Response interceptor: handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token only if not already on login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data)
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data)
};

export const familyAPI = {
  getFamilies: () => api.get('/families'),
  getFamilyById: (id) => api.get(`/families/${id}`),
  createFamily: (data) => api.post('/families', data),
  updateFamily: (id, data) => api.put(`/families/${id}`, data),
  deleteFamily: (id) => api.delete(`/families/${id}`)
};

export const familyMemberAPI = {
  getMembers: (familyId) => api.get('/family-members', { params: { familyId } }),
  getMemberById: (id) => api.get(`/family-members/${id}`),
  addMember: (data) => api.post('/family-members', data),
  updateMember: (id, data) => api.put(`/family-members/${id}`, data),
  deleteMember: (id) => api.delete(`/family-members/${id}`)
};

export const commitmentAPI = {
  getCommitments: (params) => api.get('/commitments', { params }),
  getCommitmentById: (id) => api.get(`/commitments/${id}`),
  createCommitment: (data) => api.post('/commitments', data),
  updateCommitment: (id, data) => api.put(`/commitments/${id}`, data),
  deleteCommitment: (id) => api.delete(`/commitments/${id}`)
};

export const paymentAPI = {
  getPayments: (params) => api.get('/payments', { params }),
  getUpcoming: () => api.get('/payments/upcoming'),
  getPending: () => api.get('/payments/pending'),
  getOverdue: () => api.get('/payments/overdue'),
  getHistory: () => api.get('/payments/history'),
  markAsPaid: (id, data) => api.put(`/payments/${id}/pay`, data || {})
};

export const notificationAPI = {
  getNotifications: (unreadOnly) => api.get('/notifications', { params: { unreadOnly } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getMonthly: () => api.get('/dashboard/monthly'),
  getCommitmentTypes: () => api.get('/dashboard/commitment-types')
};

export const reportAPI = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  getMonthly: () => api.get('/reports/monthly'),
  getMemberWise: () => api.get('/reports/member-wise')
};

export default api;
