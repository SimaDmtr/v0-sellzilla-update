"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/context/auth-context"
import { AccountsProvider } from "@/lib/context/accounts-context"
import { ReviewsProvider } from "@/lib/context/reviews-context"
import { FeedbacksProvider } from "@/lib/context/feedbacks-context"
import { SubscriptionProvider } from "@/lib/context/subscription-context"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import Link from "next/link"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false) // Используется для мобильного меню (Sheet)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Пользователь не авторизован, перенаправляем на страницу входа")
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Если не авторизован, не показываем контент (перенаправление уже запущено)
  if (!isAuthenticated) {
    return null
  }

  return (
    <AccountsProvider>
      <ReviewsProvider>
        <FeedbacksProvider>
          <SubscriptionProvider>
            <div className="min-h-screen bg-gray-50">
              {/* Верхняя панель */}
              <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
                <div className="flex items-center gap-4">
                  {/* Кнопка меню для мобильных */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden" // Видно только на мобильных
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>

                  <Link href="/dashboard" className="font-bold text-lg sm:text-xl hover:text-primary transition-colors">
                    Sellzilla
                  </Link>

                  {/* Навигация для десктопа */}
                  <DashboardNav variant="desktop" />
                </div>

                <UserNav />
              </header>

              {/* Мобильное меню (Sheet) */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-14 sm:h-16 items-center justify-between border-b px-4">
                    <div className="font-bold text-lg">Sellzilla</div>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <DashboardNav variant="mobile" onItemClick={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>

              {/* Основной контент */}
              <main className="flex-1 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">{children}</main>
            </div>
            <Toaster />
          </SubscriptionProvider>
        </FeedbacksProvider>
      </ReviewsProvider>
    </AccountsProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}
