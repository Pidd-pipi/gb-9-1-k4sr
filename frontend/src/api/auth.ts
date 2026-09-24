import api from './axios'

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: { username: string; email: string; password: string }) =>
    api.post('/auth/register', userData),

  getCurrentUser: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),
}
