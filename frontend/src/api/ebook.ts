import api from './axios'
import type { ReadingProgress } from '../types'

export interface ReadingProgressPayload {
  currentPage: number
  bookmarks: number[]
  expectedVersion: number | null
}

export const ebookApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get('/ebooks', { params }),

  getById: (id: string) => api.get(`/ebooks/${id}`),

  getSample: (id: string) => api.get(`/ebooks/${id}/sample`),

  purchase: (id: string) => api.post(`/ebooks/${id}/purchase`),

  create: (data: any) => api.post('/ebooks', data),

  getProgress: (id: string) =>
    api.get(`/ebooks/${id}/progress`, {
      headers: { 'X-Skip-Error-Toast': 'true' },
    }),

  saveProgress: (id: string, payload: ReadingProgressPayload) =>
    api.put<{ success: boolean; message: string; data: ReadingProgress }>(
      `/ebooks/${id}/progress`,
      payload,
      { headers: { 'X-Skip-Error-Toast': 'true' } }
    ),
}
