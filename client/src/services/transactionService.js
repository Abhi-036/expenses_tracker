import api from './api';

export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/transactions/${id}`).then((r) => r.data),
  create: (data) => api.post('/transactions', data).then((r) => r.data),
  update: (id, data) => api.put(`/transactions/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/transactions/${id}`).then((r) => r.data),

  exportCSV: async () => {
    const res = await api.get('/transactions/export/csv', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'transactions.csv');

    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  resetDemoData: () =>
    api.delete('/transactions/demo/reset').then((r) => r.data),
};
