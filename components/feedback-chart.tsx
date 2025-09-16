"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, type FeedbackStatsResponse } from "@/lib/api"
import { format, subMonths, subYears, eachDayOfInterval } from "date-fns"
import { ru } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"

type TimeRange = "month" | "half_year" | "year"

interface FeedbackChartProps {
  onStatsLoaded?: (totals: { totalFeedbacks: number; totalDeletedFeedbacks: number }) => void
}

export function FeedbackChart({ onStatsLoaded }: FeedbackChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("month")
  const [chartData, setChartData] = useState<
    {
      day: string
      newCount: number
      deletedCount: number
    }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map())

  const fetchData = async () => {
    if (loadingRef.current) return

    const cacheKey = `feedback-stats-${timeRange}`
    const cached = cacheRef.current.get(cacheKey)
    const now = Date.now()

    // Use cache if data is less than 30 seconds old
    if (cached && now - cached.timestamp < 30000) {
      setChartData(cached.data.chartData)
      if (onStatsLoaded) {
        onStatsLoaded(cached.data.totals)
      }
      setLoading(false)
      return
    }

    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      let dateFrom: Date
      const dateTo = new Date()

      switch (timeRange) {
        case "month":
          dateFrom = subMonths(dateTo, 1)
          break
        case "half_year":
          dateFrom = subMonths(dateTo, 6)
          break
        case "year":
          dateFrom = subYears(dateTo, 1)
          break
        default:
          dateFrom = subMonths(dateTo, 1)
      }

      const formattedDateFrom = format(dateFrom, "yyyy-MM-dd")
      const formattedDateTo = format(dateTo, "yyyy-MM-dd")

      const data: FeedbackStatsResponse = await apiClient.getFeedbackStats(formattedDateFrom, formattedDateTo)

      const allDates = eachDayOfInterval({ start: dateFrom, end: dateTo }).map((date) => format(date, "yyyy-MM-dd"))

      const newFeedbacksMap = new Map(data.new_feedbacks.map((item) => [item.day, item.count]))
      const deletedFeedbacksMap = new Map(data.deleted_feedbacks.map((item) => [item.day, item.count]))

      const processedChartData = allDates.map((day) => ({
        day,
        newCount: newFeedbacksMap.get(day) || 0,
        deletedCount: deletedFeedbacksMap.get(day) || 0,
      }))

      const totals = {
        totalFeedbacks: data.total_feedbacks,
        totalDeletedFeedbacks: data.total_deleted_feedbacks,
      }

      // Cache the result
      cacheRef.current.set(cacheKey, {
        data: { chartData: processedChartData, totals },
        timestamp: now,
      })

      setChartData(processedChartData)
      if (onStatsLoaded) {
        onStatsLoaded(totals)
      }
    } catch (err) {
      console.error("Failed to fetch feedback stats:", err)
      setError("Не удалось загрузить статистику. Пожалуйста, попробуйте позже.")
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const formattedChartData = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      day: format(new Date(item.day), "dd.MM", { locale: ru }),
    }))
  }, [chartData])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <CardTitle></CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            onClick={() => setTimeRange("month")}
            size="sm"
          >
            Месяц
          </Button>
          <Button
            variant={timeRange === "half_year" ? "default" : "outline"}
            onClick={() => setTimeRange("half_year")}
            size="sm"
          >
            Полгода
          </Button>
          <Button variant={timeRange === "year" ? "default" : "outline"} onClick={() => setTimeRange("year")} size="sm">
            Год
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedChartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tickFormatter={(tick) => tick}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs text-gray-500"
                />
                <YAxis tickLine={false} axisLine={false} className="text-xs text-gray-500" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="newCount"
                  name="Новые отзывы"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="deletedCount"
                  name="Удаленные отзывы"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
