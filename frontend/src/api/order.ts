import api from './axios'

export const orderApi = {
  list: () => api.get('/orders'),

  getById: (id: string) => api.get(`/orders/${id}`),

  create: (data: { type: string; itemId: string; plan?: string }) =>
    api.post('/orders', data),

  pay: (orderId: string) => api.post(`/orders/${orderId}/pay`),

  requestInvoice: (orderId: string, data: any) =>
    api.post(`/orders/${orderId}/invoice`, data),
}
