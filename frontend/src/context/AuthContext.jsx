import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  api,
  getAccessToken,
  setTokens,
  clearTokens,
  decodeAccessToken,
  getRefreshToken
} from '../api/client'

const AuthContext = createContext(null)

function readUserFromToken() {
  const token = getAccessToken()
  if (!token) return null
  const claims = decodeAccessToken(token)
  if (!claims) return null
  return { userId: claims.sub, gmail: claims.gmail }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUserFromToken)

  useEffect(() => {
    setUser(readUserFromToken())
  }, [])

  const login = useCallback(async (gmail, password) => {
    const data = await api.login(gmail, password)
    setTokens(data)
    setUser(readUserFromToken())
    return data
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    clearTokens()
    setUser(null)
    if (refreshToken) {
      // Best-effort - don't block the UI on this.
      api.logout(refreshToken).catch(() => {})
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
