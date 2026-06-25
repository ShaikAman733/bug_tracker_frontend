import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthUser, Role, TokenPair } from '../types'

export const API_BASE_URL =
  "https://web-production-199ac.up.railway.app";

const ACCESS_KEY = 'btl_access'
const REFRESH_KEY = 'btl_refresh'
const USERNAME_KEY = 'btl_username'
const USER_KEY = 'btl_user'

function parseStoredUser(value: string | null): AuthUser | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<AuthUser>
    const role = parsed.role
    if (
      typeof parsed.username === 'string' &&
      (role === 'ADMINISTRATOR' || role === 'DEVELOPER')
    ) {
      return {
        id: typeof parsed.id === 'number' ? parsed.id : null,
        username: parsed.username,
        email: typeof parsed.email === 'string' ? parsed.email : null,
        role,
        designation: typeof parsed.designation === 'string' ? parsed.designation : null,
      }
    }
  } catch {
    return null
  }
  return null
}

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  getUsername: () => localStorage.getItem(USERNAME_KEY),
  getUser: () => parseStoredUser(localStorage.getItem(USER_KEY)),
  setTokens: (tokens: TokenPair, username?: string) => {
    localStorage.setItem(ACCESS_KEY, tokens.access)
    localStorage.setItem(REFRESH_KEY, tokens.refresh)
    if (username) localStorage.setItem(USERNAME_KEY, username)
  },
  setUser: (user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(USERNAME_KEY, user.username)
  },
  setRole: (role: Role) => {
    const current = parseStoredUser(localStorage.getItem(USER_KEY))
    if (!current) return
    localStorage.setItem(USER_KEY, JSON.stringify({ ...current, role }))
  },
  setAccess: (access: string) => localStorage.setItem(ACCESS_KEY, access),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Queue concurrent requests while a single refresh call is in flight.
let isRefreshing = false
let pendingQueue: Array<(token: string | null) => void> = []

function resolveQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token))
  pendingQueue = []
}
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    const isLoginCall = originalRequest?.url?.includes('/login')

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isLoginCall) {
      return Promise.reject(error)
    }

    const refresh = tokenStorage.getRefresh()
    if (!refresh) {
      tokenStorage.clear()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newToken) => {
          if (!newToken) return reject(error)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(apiClient(originalRequest))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await axios.post<{ access: string }>(
        `${API_BASE_URL}/api/login/refresh/`,
        { refresh },
      )
      tokenStorage.setAccess(data.access)
      resolveQueue(data.access)
      originalRequest.headers.Authorization = `Bearer ${data.access}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      resolveQueue(null)
      tokenStorage.clear()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

/** Extracts a human-readable message from a DRF error response. */
export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data
    if (typeof body === 'string') return body
    if (body && typeof body === 'object') {
      const parts: string[] = []
      for (const [field, value] of Object.entries(body)) {
        const msg = Array.isArray(value) ? value.join(' ') : String(value)
        parts.push(field === 'detail' || field === 'non_field_errors' ? msg : `${field}: ${msg}`)
      }
      if (parts.length) return parts.join(' | ')
    }
    if (error.message) return error.message
  }
  return 'Something went wrong. Please try again.'
}

export default apiClient
