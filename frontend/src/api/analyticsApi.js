import api from './client';

export const analyticsApi = {
  getProjectAnalytics: async (projectId) => {
    const res = await api.get(`/analytics/project/${projectId}`);
    return res.data;
  },
  getGlobalAnalytics: async () => {
    const res = await api.get('/analytics/global');
    return res.data;
  }
};
