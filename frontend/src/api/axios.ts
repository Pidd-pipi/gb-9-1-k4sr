import axios from 'axios'
import { message } from 'antd'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** 为 true 时 401 只拒绝请求、不跳转登录页（由调用方自行处理） */
    silentAuth?: boolean
  }
}

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
    if (error.response?.status === 401) {
      // 标记为静默处理的请求（如阅读进度保存）不强制跳转，只提示
      if (error.config?.silentAuth) {
        return Promise.reject(error)
      }
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.response?.status === 409) {
      // 阅读进度等乐观锁冲突由调用方弹出冲突处理弹窗，不显示全局提示
      return Promise.reject(error)
    } else if (error.response?.data?.message) {
      message.error(error.response.data.message)
    } else {
      message.error('请求失败，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default api
