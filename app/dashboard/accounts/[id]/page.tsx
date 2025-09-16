"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AccountSettingsForm } from "@/components/account-settings-form"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Компонент скелетона для страницы настроек аккаунта
function AccountSettingsPageSkeleton() {
  return (
    <div className="container py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-6">
        {/* Информация об аккаунте */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Данные подключения */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Настройки автоматизации */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <Skeleton className="h-6 w-48" />
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-16" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

export default function AccountSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const accountId = params.id as string

  useEffect(() => {
    // Имитируем загрузку
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleComplete = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return <AccountSettingsPageSkeleton />
  }

  if (!accountId) {
    return (
      <div className="container py-6 px-4">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Аккаунт не найден</h2>
          <p className="text-gray-500 mb-6">Аккаунт с указанным ID не существует или был удален</p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к обзору
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>
        <h1 className="text-2xl font-bold mb-2">Настройки аккаунта</h1>
        <p className="text-gray-500">Настройте подключение и автоматизацию для аккаунта Wildberries</p>
      </div>

      <AccountSettingsForm accountId={accountId} onComplete={handleComplete} />
    </div>
  )
}
