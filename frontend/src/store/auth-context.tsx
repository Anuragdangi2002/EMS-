import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setAccessToken, unwrap } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import type { Role, User } from '../types/models'

type AuthState = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<User>; logout: () => Promise<void>; hasRole: (...roles: Role[]) => boolean }
const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const restore = async () => {
      try {
        const me = await api.get(ENDPOINTS.auth.me).then(unwrap<{ user: User }>)
        setUser(me.user)
      } catch {
        try {
          const refreshed = await api.post(ENDPOINTS.auth.refresh).then(unwrap<{ accessToken: string }>)
          setAccessToken(refreshed.accessToken)
          const me = await api.get(ENDPOINTS.auth.me).then(unwrap<{ user: User }>)
          setUser(me.user)
        } catch { setAccessToken(null) }
      } finally { setLoading(false) }
    }
    void restore()
  }, [])
  const value = useMemo<AuthState>(() => ({
    user, loading,
    login: async (email, password) => {
      const result = await api.post(ENDPOINTS.auth.login, { email, password }).then(unwrap<{ user: User; accessToken: string }>)
      setAccessToken(result.accessToken); setUser(result.user); return result.user
    },
    logout: async () => { try { await api.post(ENDPOINTS.auth.logout) } finally { setAccessToken(null); setUser(null) } },
    hasRole: (...roles) => !!user && roles.includes(user.role)
  }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used in AuthProvider'); return value }
