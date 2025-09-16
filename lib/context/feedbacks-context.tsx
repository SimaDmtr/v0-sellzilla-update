"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { apiClient, type FeedbackItem, type FeedbacksFilters } from "@/lib/api"
import { useAuth } from "@/lib/context/auth-context"
import { toast } from "@/components/ui/use-toast"

interface FeedbacksContextType {
  feedbacks: FeedbackItem[]
  isLoading: boolean
  error: string | null
  total: number
  hasNext: boolean
  filters: FeedbacksFilters | null // Can be null initially
  pageSize: number
  setFilters: (filters: FeedbacksFilters) => void
  setPageSize: (size: number) => void
  loadFeedbacks: () => Promise<void>
  refreshFeedbacks: () => Promise<void>
  updateFeedbackStatus: (feedbackId: string, status: string) => Promise<void>
}

const FeedbacksContext = createContext<FeedbacksContextType | undefined>(undefined)

// Функция для получения размера страницы из localStorage
function getStoredPageSize(): number {
  if (typeof window === "undefined") return 20
  const stored = localStorage.getItem("feedbacks_page_size")
  return stored ? Number.parseInt(stored, 10) : 20
}

// Функция для сохранения размера страницы в localStorage
function setStoredPageSize(size: number): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("feedbacks_page_size", size.toString())
  }
}

// Helper function for deep comparison of filters, especially for array values like 'valuation'
const areFiltersEqual = (f1: FeedbacksFilters, f2: FeedbacksFilters) => {
  const keys1 = Object.keys(f1) as Array<keyof FeedbacksFilters>
  const keys2 = Object.keys(f2) as Array<keyof FeedbacksFilters>

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (key === "valuation") {
      const val1 = f1[key]
      const val2 = f2[key]
      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) return false
        if (!val1.every((v, i) => v === val2[i])) return false
      } else if (val1 !== val2) {
        return false
      }
    } else {
      if (f1[key] !== f2[key]) return false
    }
  }
  return true
}

export function FeedbacksProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [pageSize, setPageSizeState] = useState(getStoredPageSize())
  // Initialize filters as null to prevent initial load on non-reviews pages
  const [filters, setFiltersState] = useState<FeedbacksFilters | null>(null)

  const loadingRef = useRef(false)

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setStoredPageSize(size)
    // Обновляем фильтры с новым размером страницы и сбрасываем offset
    setFiltersState(
      (prev) =>
        ({
          ...(prev || {}), // Preserve existing filters if they exist, otherwise start fresh
          limit: size,
          offset: 0,
        }) as FeedbacksFilters,
    ) // Explicitly cast to FeedbacksFilters
  }, [])

  const loadFeedbacks = useCallback(async () => {
    // Only proceed if authenticated, not loading auth, not already loading, and filters are set
    if (!isAuthenticated || authLoading || loadingRef.current || !filters) {
      return
    }

    loadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      console.log("Загружаем отзывы с фильтрами:", filters)
      const response = await apiClient.getFeedbacks(filters)
      console.log("Отзывы получены:", response)

      setFeedbacks(response.results)
      setTotal(response.total)
      setHasNext(response.has_next)
    } catch (error) {
      console.error("Ошибка при загрузке отзывов:", error)

      let errorMessage = "Ошибка загрузки отзывов"

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Ошибка подключения к серверу. Проверьте интернет-соединение."
        } else if (error.message.includes("404")) {
          setFeedbacks([])
          setTotal(0)
          setHasNext(false)
          setError(null)
          return
        } else if (
          error.message.includes("401") ||
          error.message.includes("403") ||
          error.message.includes("Unauthorized")
        ) {
          errorMessage = "Ошибка авторизации. Попробуйте войти заново."
          apiClient.removeToken()
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
      setFeedbacks([])
      setTotal(0)
      setHasNext(false)

      if (!error?.message?.includes("404")) {
        toast({
          title: "Ошибка загрузки отзывов",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [isAuthenticated, authLoading, filters])

  const refreshFeedbacks = useCallback(async () => {
    // If filters are null, set them to default to trigger a load
    if (!filters) {
      setFiltersState({
        limit: pageSize,
        offset: 0,
      })
      return
    }
    const resetFilters = {
      ...filters,
      offset: 0,
    }
    setFiltersState(resetFilters)
  }, [filters, pageSize])

  // This useEffect will only run loadFeedbacks if filters are not null and they change
  useEffect(() => {
    if (filters) {
      loadFeedbacks()
    }
  }, [filters, loadFeedbacks]) // loadFeedbacks is a stable useCallback

  const updateFilters = useCallback(
    (newFilters: FeedbacksFilters) => {
      const finalFilters = {
        ...newFilters,
        limit: newFilters.limit || pageSize,
        offset: newFilters.offset || 0,
      }
      // Only update if filters are actually different to prevent unnecessary re-fetches
      if (!filters || !areFiltersEqual(filters, finalFilters)) {
        setFiltersState(finalFilters)
      }
    },
    [pageSize, filters],
  )

  // Функция для обновления статуса отзыва
  const updateFeedbackStatus = useCallback(async (feedbackId: string, status: string) => {
    try {
      await apiClient.updateFeedbackStatus({ id: feedbackId, status })

      // Обновляем статус в локальном состоянии
      setFeedbacks((prev) => prev.map((feedback) => (feedback.id === feedbackId ? { ...feedback, status } : feedback)))
    } catch (error) {
      console.error("Ошибка при обновлении статуса отзыва:", error)
      throw error
    }
  }, []) // No dependencies needed for this callback, it just uses state setters.

  return (
    <FeedbacksContext.Provider
      value={{
        feedbacks,
        isLoading,
        error,
        total,
        hasNext,
        filters,
        pageSize,
        setFilters: updateFilters,
        setPageSize,
        loadFeedbacks,
        refreshFeedbacks,
        updateFeedbackStatus,
      }}
    >
      {children}
    </FeedbacksContext.Provider>
  )
}

export function useFeedbacks() {
  const context = useContext(FeedbacksContext)
  if (context === undefined) {
    throw new Error("useFeedbacks must be used within a FeedbacksProvider")
  }
  return context
}
