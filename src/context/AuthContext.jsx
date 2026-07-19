import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiLogin, apiSignup, apiGetMe, getToken, clearToken } from '../services/api'

const AuthContext = createContext()

// Only these roles are allowed to access the frontend
const ALLOWED_ROLES = new Set(['admin', 'manager', 'employee'])

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)  // true while we verify the token on mount

  // ------------------------------------------------------------------
  // On mount: if a JWT exists in localStorage, validate it with /auth/me
  // ------------------------------------------------------------------
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    apiGetMe()
      .then((data) => {
        if (data.user && ALLOWED_ROLES.has(data.user.role)) {
          setUser(data.user)
        } else {
          // Role not allowed — treat as logged out
          clearToken()
          setUser(null)
        }
      })
      .catch(() => {
        // Token expired or invalid — clean up
        clearToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // ------------------------------------------------------------------
  // Login: calls POST /auth/login
  // ------------------------------------------------------------------
  const login = async (email, password) => {
    try {
      const data = await apiLogin({ email, password })
      if (!data.user?.role || !ALLOWED_ROLES.has(data.user.role)) {
        clearToken()
        return {
          success: false,
          error: `Access denied. Your role "${data.user?.role || 'unknown'}" is not authorized for this application.`,
        }
      }
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' }
    }
  }

  // ------------------------------------------------------------------
  // Register: calls POST /auth/signup
  // ------------------------------------------------------------------
  const register = async ({ name, email, password }) => {
    try {
      const data = await apiSignup({ name, email, password })
      if (!data.user?.role || !ALLOWED_ROLES.has(data.user.role)) {
        clearToken()
        return {
          success: false,
          error: `Access denied. Your role "${data.user?.role || 'unknown'}" is not authorized for this application.`,
        }
      }
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' }
    }
  }

  // ------------------------------------------------------------------
  // Logout: clear token and user state
  // ------------------------------------------------------------------
  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
