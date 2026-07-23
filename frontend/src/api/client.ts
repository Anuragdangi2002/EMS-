import axios, { type InternalAxiosRequestConfig } from 'axios'
import { ENDPOINTS } from './endpoints'

export type ApiEnvelope<T> = { success: boolean; message: string; data: T }

let accessToken = sessionStorage.getItem('ems_access_token')
let refreshPromise: Promise<string | null> | null = null

type AuthErrorListener = () => void
let authErrorListener: AuthErrorListener | null = null

export const onAuthError = (listener: AuthErrorListener) => {
  authErrorListener = listener
}

export const triggerAuthError = () => {
  if (authErrorListener) authErrorListener()
}

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
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as InternalAxiosRequestConfig
    if (!request) return Promise.reject(error)

    // Check if it is a 401 error
    if (error.response?.status !== 401) return Promise.reject(error)

    // Exclude public authentication endpoints from retry logic
    const isPublicAuthEndpoint =
      request.url?.includes(ENDPOINTS.auth.login) ||
      request.url?.includes(ENDPOINTS.auth.register) ||
      request.url?.includes(ENDPOINTS.auth.forgotPassword) ||
      request.url?.includes(ENDPOINTS.auth.resetPassword) ||
      request.url?.includes(ENDPOINTS.auth.refresh)

    if (isPublicAuthEndpoint) {
      return Promise.reject(error)
    }

    // Check if we have already retried this request using custom HTTP header 'x-retry'
    // Custom headers are preserved by Axios when cloning config objects.
    if (request.headers?.['x-retry']) {
      return Promise.reject(error)
    }

    // Only attempt token refresh if the original request was sent with an access token
    if (!accessToken) {
      return Promise.reject(error)
    }

    try {
      request.headers = request.headers || {}
      request.headers['x-retry'] = 'true'

      // Deduplicate concurrent token refresh API calls
      refreshPromise ??= api.post<ApiEnvelope<{ accessToken: string }>>(ENDPOINTS.auth.refresh)
        .then(({ data }) => data.data.accessToken)
        .catch(() => null)
        .finally(() => { refreshPromise = null })

      const token = await refreshPromise
      if (!token) throw error

      setAccessToken(token)
      request.headers.Authorization = `Bearer ${token}`
      return api(request)
    } catch (err) {
      setAccessToken(null)
      triggerAuthError()
      return Promise.reject(err)
    }
  }
)

export const unwrap = <T>(response: { data: ApiEnvelope<T> }) => response.data.data
