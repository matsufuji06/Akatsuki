import {
  type ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react'
import {
  clearStoredAuthToken,
  clearStoredUser,
  getStoredAuthToken,
  getStoredUser,
  login as apiLogin,
  register as apiRegister,
  setStoredAuthToken,
  setStoredUser,
} from '../api/client'
import type { ApiUser } from '../types'

type AuthState = {
  isAuthenticated: boolean
  isBootstrapping: boolean
  user: ApiUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => getStoredAuthToken())
  const [user, setUser] = useState<ApiUser | null>(() => getStoredUser())

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password)
    setStoredAuthToken(result.token)
    setStoredUser(result.user)
    setToken(result.token)
    setUser(result.user)
  }, [])

  const register = useCallback(
    async (payload: {
      name: string
      email: string
      password: string
      password_confirmation: string
    }) => {
      const result = await apiRegister(payload)
      setStoredAuthToken(result.token)
      setStoredUser(result.user)
      setToken(result.token)
      setUser(result.user)
    },
    [],
  )

  const logout = useCallback(() => {
    clearStoredAuthToken()
    clearStoredUser()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: token !== null && user !== null,
      isBootstrapping: false,
      user,
      token,
      login,
      register,
      logout,
    }),
    [login, logout, register, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
