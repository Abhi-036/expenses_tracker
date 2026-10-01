import api from './api';

export const recurringService = {
  getAll: () =>
    api.get('/recurring-transactions').then((r) => r.data),

  create: (data) =>
    api.post('/recurring-transactions', data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/recurring-transactions/${id}`, data).then((r) => r.data),

  remove: (id) =>
    api.delete(`/recurring-transactions/${id}`).then((r) => r.data),

  processAll: () =>
    api.post('/recurring-transactions/process').then((r) => r.data),
};
