import api from './axios'

export const audioApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get('/audio', { params }),

  getById: (id: string) => api.get(`/audio/${id}`),

  getEpisode: (courseId: string, episodeId: string) =>
    api.get(`/audio/${courseId}/episodes/${episodeId}`),

  getStreamUrl: (courseId: string, episodeId: string) =>
    `/api/audio/${courseId}/episodes/${episodeId}/stream`,

  purchase: (id: string) => api.post(`/audio/${id}/purchase`),

  create: (data: any) => api.post('/audio', data),

  createEpisode: (courseId: string, data: any) =>
    api.post(`/audio/${courseId}/episodes`, data),
}
