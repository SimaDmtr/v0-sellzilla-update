"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import type { WBAccountResponse } from "@/lib/api"
import { useAuth } from "@/lib/context/auth-context"
import { useBalance } from "@/lib/context/balance-context"

interface AccountsContextType {
  accounts: WBAccountResponse[]
  isLoading: boolean
  error: string | null
  refreshAccounts: () => Promise<void>
  deleteAccount: (accountId: string) => Promise<boolean>
  addAccountOptimistic: (account: WBAccountResponse) => void
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined)

export function useAccounts() {
  const context = useContext(AccountsContext)
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountsProvider")
  }
  return context
}

interface AccountsProviderProps {
  children: ReactNode
}

export function AccountsProvider({ children }: AccountsProviderProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { updateBalanceFromData } = useBalance()
  const [accounts, setAccounts] = useState<WBAccountResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialLoadRef = useRef(false)

  const fetchAccounts = async (force = false) => {
    if (!isAuthenticated || authLoading) {
      console.log("Не можем загрузить аккаунты: не авторизован или загружается авторизация")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log("Загружаем аккаунты...", force ? "(принудительно)" : "")
      const apiAccounts = await apiClient.getWBAccounts()
      console.log("Аккаунты получены:", apiAccounts)
      setAccounts(apiAccounts)
    } catch (err) {
      console.error("Error fetching accounts:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch accounts")
      setAccounts([])
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async (accountId: string): Promise<boolean> => {
    try {
      console.log("Удаляем аккаунт:", accountId)
      await apiClient.deleteWBAccount(accountId)
      console.log("Аккаунт успешно удален на сервере")

      // Оптимистично удаляем аккаунт из локального состояния
      setAccounts((prevAccounts) => {
        const updatedAccounts = prevAccounts.filter((account) => account.id !== accountId)
        console.log("Аккаунт удален из локального состояния. Осталось аккаунтов:", updatedAccounts.length)
        return updatedAccounts
      })

      // ОБНОВЛЯЕМ БАЛАНС И СРАЗУ ИСПОЛЬЗУЕМ ПОЛУЧЕННЫЕ ДАННЫЕ
      console.log("Обновляем баланс после удаления аккаунта...")
      try {
        const balanceData = await apiClient.getUserBalance()
        console.log("✅ Получены данные баланса после удаления:", balanceData)
        updateBalanceFromData(balanceData)
        console.log("✅ Баланс успешно обновлен после удаления")
      } catch (balanceError) {
        console.error("❌ Ошибка обновления баланса после удаления:", balanceError)
      }

      return true
    } catch (err) {
      console.error("Error deleting account:", err)
      setError(err instanceof Error ? err.message : "Failed to delete account")
      return false
    }
  }

  const addAccountOptimistic = (account: WBAccountResponse) => {
    console.log("Добавляем аккаунт в локальное состояние:", account.name)
    setAccounts((prevAccounts) => {
      const updatedAccounts = [...prevAccounts, account]
      console.log("Аккаунт добавлен в локальное состояние. Всего аккаунтов:", updatedAccounts.length)
      return updatedAccounts
    })
  }

  const refreshAccounts = async () => {
    console.log("Принудительное обновление списка аккаунтов")
    await fetchAccounts(true)
  }

  useEffect(() => {
    if (authLoading) return

    // Only fetch if authenticated AND it's the very first load for this session
    if (isAuthenticated && !initialLoadRef.current) {
      fetchAccounts() // Call fetchAccounts
      initialLoadRef.current = true // Mark as loaded
    } else if (!isAuthenticated) {
      // Reset if unauthenticated
      setAccounts([])
      setError(null)
      initialLoadRef.current = false // Reset for future login
    }
  }, [isAuthenticated, authLoading])

  return (
    <AccountsContext.Provider
      value={{ accounts, isLoading, error, refreshAccounts, deleteAccount, addAccountOptimistic }}
    >
      {children}
    </AccountsContext.Provider>
  )
}
