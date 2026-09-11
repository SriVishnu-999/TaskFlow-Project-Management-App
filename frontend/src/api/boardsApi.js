import api from './client';

export const boardsApi = {
  getBoardById: async (boardId) => {
    const res = await api.get(`/boards/${boardId}`);
    return res.data;
  },
  getProjectDefaultBoard: async (projectId) => {
    const res = await api.get(`/boards/project/${projectId}/default`);
    return res.data;
  },
  createBoard: async (data) => {
    const res = await api.post('/boards', data);
    return res.data;
  },
  addColumn: async (boardId, data) => {
    const res = await api.post(`/boards/${boardId}/columns`, data);
    return res.data;
  },
  updateColumn: async (columnId, data) => {
    const res = await api.put(`/boards/columns/${columnId}`, data);
    return res.data;
  },
  deleteColumn: async (columnId) => {
    const res = await api.delete(`/boards/columns/${columnId}`);
    return res.data;
  }
};
