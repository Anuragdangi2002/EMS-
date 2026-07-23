import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getAccessToken, onAuthError, setAccessToken, unwrap } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import type { Role, User } from '../types/models'

type AuthState = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<User>; logout: () => Promise<void>; hasRole: (...roles: Role[]) => boolean }
const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Register the unauthorized error callback to invalidate user session state
    onAuthError(() => {
      setUser(null)
    })

    const restore = async () => {
      try {
        const token = getAccessToken()
        if (token) {
          const me = await api.get(ENDPOINTS.auth.me).then(unwrap<{ user: User }>)
          setUser(me.user)
        } else {
          // Attempt silent session restoration using refresh token HttpOnly cookie
          const refreshed = await api.post(ENDPOINTS.auth.refresh).then(unwrap<{ accessToken: string }>)
          setAccessToken(refreshed.accessToken)
          const me = await api.get(ENDPOINTS.auth.me).then(unwrap<{ user: User }>)
          setUser(me.user)
        }
      } catch {
        setAccessToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    void restore()
  }, [])

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    login: async (email, password) => {
      const result = await api.post(ENDPOINTS.auth.login, { email, password }).then(unwrap<{ user: User; accessToken: string }>)
      setAccessToken(result.accessToken)
      setUser(result.user)
      return result.user
    },
    logout: async () => {
      try {
        await api.post(ENDPOINTS.auth.logout)
      } finally {
        setAccessToken(null)
        setUser(null)
      }
    },
    hasRole: (...roles) => {
      if (!user) return false
      // Director/Admin role mapping support
      const currentRole = user.role === 'DIRECTOR' ? 'ADMIN' : user.role
      return roles.includes(currentRole as Role)
    }
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used in AuthProvider')
  return value
}
