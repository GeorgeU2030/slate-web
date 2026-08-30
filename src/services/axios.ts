import axios from 'axios'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStatusStore } from '@/store/useAppStatusStore'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Token-Delivery': 'cookie',
  },
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (res) => {
    useAppStatusStore.getState().reset()
    return res
  },
  async (error) => {
    const original = error.config
    const isRefreshCall = original?.url?.includes('/auth/refresh')

    if (!error.response) {
      if (isRefreshCall) {
        useAuthStore.getState().clearTokens()
      } else {
        useAppStatusStore.getState().setOffline(true)
      }
      return Promise.reject(error)
    }
    if (error.response.status >= 500 && !isRefreshCall) {
      useAppStatusStore.getState().setServerDown(true)
    }

    if (error.response?.status === 401 && !original._retry) {
      // avoid retry /auth/refresh
      if (isRefreshCall) {
        useAuthStore.getState().clearTokens()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return axiosInstance(original)
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        const newToken = await useAuthStore.getState().refreshAccessToken()
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)