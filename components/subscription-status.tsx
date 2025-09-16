"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CreditCard, AlertTriangle, CheckCircle } from "lucide-react"
import { useSubscription } from "@/lib/context/subscription-context"
import Link from "next/link"

export function SubscriptionStatus() {
  const { subscription, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-700">Подписка не активна</CardTitle>
          </div>
          <CardDescription>Для использования всех функций необходимо оформить подписку</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/pricing">
            <Button className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Выбрать план
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const startDate = new Date(subscription.start)
  const endDate = new Date(subscription.end)
  const now = new Date()
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const progress = Math.max(0, Math.min(100, ((totalDays - remainingDays) / totalDays) * 100))

  const isExpiringSoon = remainingDays <= 7 && remainingDays > 0
  const isExpired = remainingDays <= 0

  return (
    <Card className={isExpired ? "border-red-200" : isExpiringSoon ? "border-yellow-200" : "border-green-200"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExpired ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : isExpiringSoon ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <CardTitle className={isExpired ? "text-red-700" : isExpiringSoon ? "text-yellow-700" : "text-green-700"}>
              {isExpired ? "Подписка истекла" : isExpiringSoon ? "Подписка истекает" : "Подписка активна"}
            </CardTitle>
          </div>
          <Badge variant={isExpired ? "destructive" : isExpiringSoon ? "secondary" : "default"}>
            {subscription.displayText}
          </Badge>
        </div>
        <CardDescription>
          {isExpired
            ? "Подписка истекла. Обновите план для продолжения работы."
            : isExpiringSoon
              ? `Подписка истекает через ${remainingDays} ${remainingDays === 1 ? "день" : remainingDays < 5 ? "дня" : "дней"}`
              : `Подписка активна до ${endDate.toLocaleDateString("ru-RU")}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isExpired && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Использовано</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Начало: {startDate.toLocaleDateString("ru-RU")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Окончание: {endDate.toLocaleDateString("ru-RU")}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/pricing" className="flex-1">
            <Button variant={isExpired ? "default" : "outline"} className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              {isExpired ? "Продлить подписку" : "Изменить план"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
