import api from './client';

export const tasksApi = {
  getTaskById: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data;
  },
  getTasksByProject: async (projectId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.priority !== undefined && filters.priority !== null) params.append('priority', filters.priority);
    if (filters.status !== undefined && filters.status !== null) params.append('status', filters.status);
    if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);

    const res = await api.get(`/tasks/project/${projectId}?${params.toString()}`);
    return res.data;
  },
  createTask: async (data) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },
  updateTask: async (taskId, data) => {
    const res = await api.put(`/tasks/${taskId}`, data);
    return res.data;
  },
  moveTask: async (taskId, moveData) => {
    const res = await api.put(`/tasks/${taskId}/move`, moveData);
    return res.data;
  },
  deleteTask: async (taskId) => {
    const res = await api.delete(`/tasks/${taskId}`);
    return res.data;
  },
  getActivities: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/activities`);
    return res.data;
  }
};
