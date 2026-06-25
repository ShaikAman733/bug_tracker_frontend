import apiClient, { tokenStorage } from '../api/axiosClient'
import type { AuthUser, LoginPayload, Role, TokenPair } from '../types'

type JwtPayload = {
  user_id?: number | string
  id?: number | string
  sub?: number | string
  username?: string
  role?: string
  is_staff?: boolean
}

function decodeJwtPayload(token: string): JwtPayload {
  try {
    const [, payload] = token.split('.')
    if (!payload) return {}
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return {}
  }
}

function normalizeRole(value: unknown): Role | null {
  if (value === 'ADMINISTRATOR' || value === 'Administrator' || value === 'admin') {
    return 'ADMINISTRATOR'
  }
  if (value === 'DEVELOPER' || value === 'Developer' || value === 'developer') {
    return 'DEVELOPER'
  }
  return null
}

function numberOrNull(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function userFromToken(accessToken: string, fallbackUsername: string): AuthUser {
  const payload = decodeJwtPayload(accessToken)
  return {
    id: numberOrNull(payload.user_id ?? payload.id ?? payload.sub),
    username: payload.username ?? fallbackUsername,
    email: null,
    role: normalizeRole(payload.role) ?? (payload.is_staff ? 'ADMINISTRATOR' : 'DEVELOPER'),
    designation: null,
  }
}

async function fetchCurrentUser(fallback: AuthUser): Promise<AuthUser> {
  try {
    // NOTE: /developers/ only returns role=DEVELOPER accounts, so an
    // Administrator would never be found there. /me/ always returns
    // whoever the token belongs to, regardless of role.
    const { data } = await apiClient.get<AuthUser>('/me/')
    return data
  } catch {
    return fallback
  }
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data } = await apiClient.post<TokenPair>('/login/', payload)
    tokenStorage.setTokens(data, payload.username)
    const fallback = userFromToken(data.access, payload.username)
    tokenStorage.setUser(fallback)
    const user = await fetchCurrentUser(fallback)
    tokenStorage.setUser(user)
    return user
  },
  logout(): void {
    tokenStorage.clear()
  },
  isAuthenticated(): boolean {
    return Boolean(tokenStorage.getAccess())
  },
  currentUsername(): string | null {
    return tokenStorage.getUsername()
  },
  currentUser(): AuthUser | null {
    return tokenStorage.getUser()
  },
  async restoreCurrentUser(): Promise<AuthUser | null> {
    const stored = tokenStorage.getUser()
    const username = tokenStorage.getUsername()
    if (!stored && !username) return null

    const fallback =
      stored ??
      ({
        id: null,
        username: username as string,
        email: null,
        role: 'DEVELOPER',
        designation: null,
      } satisfies AuthUser)

    const user = await fetchCurrentUser(fallback)
    tokenStorage.setUser(user)
    return user
  },
}