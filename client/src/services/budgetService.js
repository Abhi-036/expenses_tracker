import api from './api';

export const budgetService = {
  getAll: () => api.get('/budgets').then((r) => r.data),
  getOne: (id) => api.get(`/budgets/${id}`).then((r) => r.data),
  create: (data) => api.post('/budgets', data).then((r) => r.data),
  update: (id, data) => api.put(`/budgets/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/budgets/${id}`).then((r) => r.data),
};
