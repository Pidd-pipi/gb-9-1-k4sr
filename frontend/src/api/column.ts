import api from './axios'

export const columnApi = {
  list: (params?: { page?: number; size?: number; category?: string }) =>
    api.get('/columns', { params }),

  getById: (id: string) => api.get(`/columns/${id}`),

  getArticles: (columnId: string) => api.get(`/columns/${columnId}/articles`),

  getArticle: (columnId: string, articleId: string) =>
    api.get(`/columns/${columnId}/articles/${articleId}`),

  subscribe: (columnId: string, plan: 'MONTHLY' | 'QUARTERLY' | 'YEARLY') =>
    api.post(`/columns/${columnId}/subscribe`, { plan }),

  mySubscriptions: () => api.get('/my/subscriptions'),

  create: (data: any) => api.post('/columns', data),

  createArticle: (columnId: string, data: any) =>
    api.post(`/columns/${columnId}/articles`, data),
}
