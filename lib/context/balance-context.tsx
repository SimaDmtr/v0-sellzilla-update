"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "@/lib/api"

interface BalanceContextType {
  balance: number | null
  tariffPerDay: number | null
  isLoading: boolean
  refreshBalance: () => Promise<void>
  updateBalanceFromData: (balanceData: { balance_rub: number; tariff_per_day: number }) => void
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number | null>(null)
  const [tariffPerDay, setTariffPerDay] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshBalance = async () => {
    try {
      console.log("🔄 Запрашиваем баланс...")
      setIsLoading(true)
      const balanceData = await apiClient.getUserBalance()

      console.log("📊 Получены данные баланса:", balanceData)
      console.log("💰 Устанавливаем баланс:", balanceData.balance_rub)
      console.log("📈 Устанавливаем тариф:", balanceData.tariff_per_day)

      setBalance(balanceData.balance_rub)
      setTariffPerDay(balanceData.tariff_per_day || 0)

      console.log("✅ Баланс успешно обновлен в контексте")
    } catch (error) {
      console.error("❌ Ошибка загрузки баланса:", error)
      setBalance(null)
      setTariffPerDay(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateBalanceFromData = (balanceData: { balance_rub: number; tariff_per_day: number }) => {
    console.log("🔄 Обновляем баланс из полученных данных:", balanceData)
    setBalance(balanceData.balance_rub)
    setTariffPerDay(balanceData.tariff_per_day || 0)
    console.log("✅ Баланс обновлен из данных")
  }

  useEffect(() => {
    refreshBalance()
  }, [])

  return (
    <BalanceContext.Provider value={{ balance, tariffPerDay, isLoading, refreshBalance, updateBalanceFromData }}>
      {children}
    </BalanceContext.Provider>
  )
}

export function useBalance() {
  const context = useContext(BalanceContext)
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider")
  }
  return context
}
