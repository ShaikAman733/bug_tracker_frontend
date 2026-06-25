import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '../services/authService'
import { extractApiError } from '../api/axiosClient'
import type { AuthUser, LoginPayload, Role } from '../types'

interface AuthContextValue {
  isAuthenticated: boolean
  username: string | null
  user: AuthUser | null
  role: Role | null
  loading: boolean
  error: string | null
  login: (payload: LoginPayload) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
  const [username, setUsername] = useState<string | null>(authService.currentUsername())
  const [user, setUser] = useState<AuthUser | null>(authService.currentUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    let active = true
    async function restore() {
      setLoading(true)
      try {
        const restored = await authService.restoreCurrentUser()
        if (!active) return
        setUser(restored)
        setUsername(restored?.username ?? authService.currentUsername())
      } finally {
        if (active) setLoading(false)
      }
    }
    restore()

    return () => {
      active = false
    }
  }, [isAuthenticated])

  const login = async (payload: LoginPayload) => {
    setLoading(true)
    setError(null)
    try {
      const loggedInUser = await authService.login(payload)
      setIsAuthenticated(true)
      setUsername(loggedInUser.username)
      setUser(loggedInUser)
      return true
    } catch (err) {
      setError(extractApiError(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUsername(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      username,
      user,
      role: user?.role ?? null,
      loading,
      error,
      login,
      logout,
    }),
    [isAuthenticated, username, user, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
