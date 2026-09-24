import api from './axios'

export const creatorApi = {
  apply: (data: { bio: string; expertise: string[]; socialLinks?: string }) =>
    api.post('/creators/apply', data),

  getProfile: (id: string) => api.get(`/creators/${id}`),

  getMyProfile: () => api.get('/creators/me'),

  updateProfile: (data: any) => api.put('/creators/me', data),

  getDashboard: () => api.get('/creators/dashboard'),
}
