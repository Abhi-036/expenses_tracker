import api from './api';

export const reportService = {
  getDashboard: (params) =>
    api.get('/reports/dashboard', { params }).then((r) => r.data),

  getMonthly: (params) =>
    api.get('/reports/monthly', { params }).then((r) => r.data),
};
