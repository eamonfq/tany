import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Items
export const itemsApi = {
  getAll: (category) => api.get('/items', { params: { category } }),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
};

// Clients
export const clientsApi = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  getHistory: (id) => api.get(`/clients/${id}/history`),
};

// Quotes
export const quotesApi = {
  getAll: (params) => api.get('/quotes', { params }),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  updateStatus: (id, status) => api.put(`/quotes/${id}/status`, { status }),
  convert: (id, data) => api.post(`/quotes/${id}/convert`, data),
  delete: (id) => api.delete(`/quotes/${id}`),
};

// Invoices
export const invoicesApi = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  updateStatus: (id, status) => api.put(`/invoices/${id}/status`, { status }),
  updatePayment: (id, data) => api.put(`/invoices/${id}/payment`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  getNextNumber: () => api.get('/invoices/next-number'),
};

// Reminders
export const remindersApi = {
  getAll: (params) => api.get('/reminders', { params }),
  getToday: () => api.get('/reminders/today'),
  getUpcoming: () => api.get('/reminders/upcoming'),
  create: (data) => api.post('/reminders', data),
  updateStatus: (id, status) => api.put(`/reminders/${id}/status`, { status }),
};

// Templates
export const templatesApi = {
  getAll: () => api.get('/templates'),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getUpcomingEvents: () => api.get('/dashboard/upcoming-events'),
  getRemindersToday: () => api.get('/dashboard/reminders-today'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getMonthlyMetrics: () => api.get('/dashboard/monthly-metrics'),
};

// WhatsApp
export const whatsappApi = {
  generateLink: (phone, message) => api.get('/whatsapp/generate-link', { params: { phone, message } }),
};

export default api;
