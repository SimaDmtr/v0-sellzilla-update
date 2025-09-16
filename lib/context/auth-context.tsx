"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient, type UserResponse } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface AuthContextType {
  user: UserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  verifyLogin: (email: string, code: string) => Promise<{ success: boolean; message?: string }>
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  verifyRegistration: (email: string, code: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>
  resetPassword: (email: string, code: string, password: string) => Promise<{ success: boolean; message?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthLoader() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      </div>
    </div>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const checkAuth = async () => {
    if (isInitialized) return

    try {
      setIsLoading(true)
      if (apiClient.hasToken()) {
        const userData = await apiClient.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      apiClient.removeToken()
      setUser(null)
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.login(email, password)
      return { success: true, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || "Неизвестная ошибка" }
    }
  }

  const verifyLogin = async (email: string, code: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.verifyLogin(email, code)
      const userData = await apiClient.getCurrentUser()
      setUser(userData)
      return { success: true, message: "Авторизация успешна" }
    } catch (error: any) {
      return { success: false, message: error.message || "Неизвестная ошибка" }
    }
  }

  const register = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.register(email, password)
      return { success: true, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || "Неизвестная ошибка" }
    }
  }

  const verifyRegistration = async (email: string, code: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.verifyRegistration(email, code)
      const userData = await apiClient.getCurrentUser()
      setUser(userData)
      return { success: true, message: "Регистрация успешна" }
    } catch (error: any) {
      return { success: false, message: error.message || "Неизвестная ошибка" }
    }
  }

  const logout = async () => {
    await apiClient.logout()
    setUser(null)
  }

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.requestPasswordReset(email)
      return { success: true, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || "Неизвестная ошибка" }
    }
  }

  const resetPassword = async (
    email: string,
    code: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.resetPassword(email, code, password)
      return { success: true, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || "Неизвестная ошибка" }
    }
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.changePassword(currentPassword, newPassword)
      return { success: true, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message || "Неизвестная ошибка" }
    }
  }

  if (!isInitialized) {
    return <AuthLoader />
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyLogin,
        register,
        verifyRegistration,
        logout,
        requestPasswordReset,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
