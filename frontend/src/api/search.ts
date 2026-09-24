import api from './axios'

export const searchApi = {
  search: (query: string, params?: { page?: number; size?: number }) =>
    api.get('/search', { params: { q: query, ...params } }),
}
