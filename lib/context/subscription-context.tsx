"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  isPopular?: boolean
}

interface Subscription {
  id: string
  planId: string
  status: "active" | "inactive" | "cancelled"
  expiresAt: string
  autoRenew: boolean
}

interface SubscriptionContextType {
  plans: SubscriptionPlan[]
  currentSubscription: Subscription | null
  loading: boolean
  error: string | null
  fetchPlans: () => Promise<void>
  fetchCurrentSubscription: () => Promise<void>
  subscribeToPlan: (planId: string) => Promise<void>
  cancelSubscription: () => Promise<void>
  updateAutoRenew: (autoRenew: boolean) => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// Mock данные для демонстрации
const mockPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Базовый",
    price: 990,
    features: ["До 5 аккаунтов", "Автоответы на отзывы", "Базовая аналитика", "Email поддержка"],
  },
  {
    id: "pro",
    name: "Профессиональный",
    price: 1990,
    features: [
      "До 20 аккаунтов",
      "Автоответы и автодиалоги",
      "Расширенная аналитика",
      "Экспорт данных",
      "Приоритетная поддержка",
    ],
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Корпоративный",
    price: 4990,
    features: [
      "Неограниченное количество аккаунтов",
      "Все функции Pro",
      "API доступ",
      "Персональный менеджер",
      "SLA 99.9%",
    ],
  },
]

const mockSubscription: Subscription = {
  id: "sub_1",
  planId: "basic",
  status: "active",
  expiresAt: "2024-02-15",
  autoRenew: true,
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Имитируем загрузку планов
      await new Promise((resolve) => setTimeout(resolve, 500))
      setPlans(mockPlans)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки планов")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCurrentSubscription = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Имитируем загрузку текущей подписки
      await new Promise((resolve) => setTimeout(resolve, 500))
      setCurrentSubscription(mockSubscription)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки подписки")
    } finally {
      setLoading(false)
    }
  }, [])

  const subscribeToPlan = useCallback(async (planId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Имитируем подписку на план
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        planId,
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        autoRenew: true,
      }

      setCurrentSubscription(newSubscription)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при оформлении подписки")
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelSubscription = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Имитируем отмену подписки
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (currentSubscription) {
        setCurrentSubscription({
          ...currentSubscription,
          status: "cancelled",
          autoRenew: false,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отмене подписки")
    } finally {
      setLoading(false)
    }
  }, [currentSubscription])

  const updateAutoRenew = useCallback(
    async (autoRenew: boolean) => {
      setLoading(true)
      setError(null)

      try {
        // Имитируем обновление автопродления
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (currentSubscription) {
          setCurrentSubscription({
            ...currentSubscription,
            autoRenew,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка при обновлении настроек")
      } finally {
        setLoading(false)
      }
    },
    [currentSubscription],
  )

  const value: SubscriptionContextType = {
    plans,
    currentSubscription,
    loading,
    error,
    fetchPlans,
    fetchCurrentSubscription,
    subscribeToPlan,
    cancelSubscription,
    updateAutoRenew,
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
