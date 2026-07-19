import axios, { type InternalAxiosRequestConfig } from 'axios'
import { ENDPOINTS } from './endpoints'

export type ApiEnvelope<T> = { success: boolean; message: string; data: T }

let accessToken = sessionStorage.getItem('ems_access_token')
let refreshPromise: Promise<string | null> | null = null

export const getAccessToken = () => accessToken
export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (token) sessionStorage.setItem('ems_access_token', token)
  else sessionStorage.removeItem('ems_access_token')
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status !== 401 || request?._retry || request?.url?.includes(ENDPOINTS.auth.refresh)) return Promise.reject(error)
    request._retry = true
    try {
      refreshPromise ??= api.post<ApiEnvelope<{ accessToken: string }>>(ENDPOINTS.auth.refresh).then(({ data }) => data.data.accessToken).catch(() => null).finally(() => { refreshPromise = null })
      const token = await refreshPromise
      if (!token) throw error
      setAccessToken(token)
      request.headers.Authorization = `Bearer ${token}`
      return api(request)
    } catch {
      setAccessToken(null)
      if (!location.pathname.startsWith('/login')) location.assign('/login')
      return Promise.reject(error)
    }
  }
)

export const unwrap = <T>(response: { data: ApiEnvelope<T> }) => response.data.data
