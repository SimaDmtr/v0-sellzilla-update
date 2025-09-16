"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

// Типы для отзывов (пока используем mock данные)
interface Review {
  id: string
  productName: string
  rating: number
  text: string
  author: string
  date: string
  status: "new" | "responded" | "ignored"
  response?: string
}

interface ReviewsContextType {
  reviews: Review[]
  loading: boolean
  error: string | null
  fetchReviews: () => Promise<void>
  respondToReview: (reviewId: string, response: string) => Promise<void>
  markAsIgnored: (reviewId: string) => Promise<void>
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined)

// Mock данные для демонстрации
const mockReviews: Review[] = [
  {
    id: "1",
    productName: "Смартфон iPhone 15",
    rating: 5,
    text: "Отличный телефон, очень доволен покупкой!",
    author: "Иван И.",
    date: "2024-01-15",
    status: "new",
  },
  {
    id: "2",
    productName: "Наушники AirPods Pro",
    rating: 4,
    text: "Хорошие наушники, но цена высокая",
    author: "Мария С.",
    date: "2024-01-14",
    status: "responded",
    response: "Спасибо за отзыв! Мы ценим ваше мнение.",
  },
  {
    id: "3",
    productName: "Чехол для телефона",
    rating: 2,
    text: "Качество не очень, быстро потрескался",
    author: "Петр К.",
    date: "2024-01-13",
    status: "new",
  },
]

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Имитируем загрузку данных
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setReviews(mockReviews)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки отзывов")
    } finally {
      setLoading(false)
    }
  }, [])

  const respondToReview = useCallback(async (reviewId: string, response: string) => {
    setLoading(true)
    setError(null)

    try {
      // Имитируем отправку ответа
      await new Promise((resolve) => setTimeout(resolve, 500))

      setReviews((prev) =>
        prev.map((review) => (review.id === reviewId ? { ...review, status: "responded" as const, response } : review)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отправке ответа")
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsIgnored = useCallback(async (reviewId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Имитируем пометку как игнорируемый
      await new Promise((resolve) => setTimeout(resolve, 500))

      setReviews((prev) =>
        prev.map((review) => (review.id === reviewId ? { ...review, status: "ignored" as const } : review)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при обновлении статуса")
    } finally {
      setLoading(false)
    }
  }, [])

  const value: ReviewsContextType = {
    reviews,
    loading,
    error,
    fetchReviews,
    respondToReview,
    markAsIgnored,
  }

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
}

export function useReviews() {
  const context = useContext(ReviewsContext)
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewsProvider")
  }
  return context
}
