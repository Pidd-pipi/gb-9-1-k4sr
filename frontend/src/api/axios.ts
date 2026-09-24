import axios, { AxiosHeaders } from 'axios'
import { message } from 'antd'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const headers = error.config?.headers
    const skipToast =
      headers instanceof AxiosHeaders
        ? headers.get('X-Skip-Error-Toast') === 'true'
        : headers?.['X-Skip-Error-Toast'] === 'true'
    if (error.response?.status === 401) {
      // 阅读器等场景会自行处理未登录，避免打开页面时被强制跳走
      if (!skipToast) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    } else if (!skipToast) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message)
      } else {
        message.error('请求失败，请稍后重试')
      }
    }
    return Promise.reject(error)
  }
)

export default api
