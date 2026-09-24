import api from './axios'

export const ebookApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get('/ebooks', { params }),

  getById: (id: string) => api.get(`/ebooks/${id}`),

  getSample: (id: string) => api.get(`/ebooks/${id}/sample`),

  purchase: (id: string) => api.post(`/ebooks/${id}/purchase`),

  create: (data: any) => api.post('/ebooks', data),
}
