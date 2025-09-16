"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FeedbackChart } from "@/components/feedback-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface AnalyticsDashboardProps {
  className?: string
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Получаем данные из FeedbackChart через callback
  const handleChartDataLoad = (data: any, loading: boolean, error: string | null) => {
    setChartData(data)
    setIsLoading(loading)
    setError(error)
  }

  // Вычисляем метрики из данных графика
  const totalFeedbacks = chartData?.total_feedbacks || 0
  const totalDeleted = chartData?.total_deleted_feedbacks || 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Обзорные метрики */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего отзывов</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Ошибка загрузки</span>
              </div>
            ) : (
              <div className="text-2xl font-bold">{totalFeedbacks.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Удалённые отзывы</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Ошибка загрузки</span>
              </div>
            ) : (
              <div className="text-2xl font-bold">{totalDeleted.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Динамика отзывов */}
      <Card>
        <CardHeader>
          <CardTitle>Динамика отзывов</CardTitle>
          <CardDescription>Статистика новых и удалённых отзывов за выбранный период</CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackChart onDataLoad={handleChartDataLoad} />
        </CardContent>
      </Card>
    </div>
  )
}
