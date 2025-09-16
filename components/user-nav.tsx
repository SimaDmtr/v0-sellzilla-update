"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/context/auth-context"
import { useBalance } from "@/lib/context/balance-context"
import { LogOut, Settings, Wallet, CreditCard } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"

export function UserNav() {
  const { user, logout } = useAuth()
  const { balance, tariffPerDay } = useBalance()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [totalFeedbacks, setTotalFeedbacks] = useState<number | null>(null)
  const [totalDeletedFeedbacks, setTotalDeletedFeedbacks] = useState<number | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        // Загружаем статистику за последние 30 дней
        const dateTo = new Date()
        const dateFrom = new Date()
        dateFrom.setDate(dateTo.getDate() - 30)

        const dateFromStr = dateFrom.toISOString().split("T")[0]
        const dateToStr = dateTo.toISOString().split("T")[0]

        const stats = await apiClient.getFeedbackStats(dateFromStr, dateToStr)

        setTotalFeedbacks(stats.total_feedbacks)
        setTotalDeletedFeedbacks(stats.total_deleted_feedbacks)
      } catch (error) {
        console.error("Ошибка загрузки статистики:", error)
        // В случае ошибки оставляем null, чтобы показать "..."
      } finally {
        setIsLoadingStats(false)
      }
    }

    if (user) {
      loadStatistics()
    }
  }, [user])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) {
    return null
  }

  const userInitials =
    user.email
      ?.split("@")[0]
      .split(".")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  return (
    <div className="flex items-center gap-4">
      {/* Баланс, тариф и кнопка пополнения */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {balance !== null ? `${balance.toLocaleString()} ₽` : "Загрузка..."}
          </span>
          {tariffPerDay !== null && (
            <span className="text-xs text-muted-foreground">{tariffPerDay.toLocaleString()} ₽/день</span>
          )}
        </div>
        <Button asChild size="sm" variant="outline" className="ml-2 bg-transparent">
          <Link href="/dashboard/billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Пополнить
          </Link>
        </Button>
      </div>

      {/* Статистика отзывов */}
      <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 bg-muted/50 rounded-lg">
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Всего отзывов</span>
          <span className="text-sm font-semibold">
            {isLoadingStats ? "..." : totalFeedbacks !== null ? totalFeedbacks.toLocaleString() : "—"}
          </span>
        </div>
        <div className="w-px h-8 bg-muted-foreground/20"></div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Удалено</span>
          <span className="text-sm font-semibold">
            {isLoadingStats ? "..." : totalDeletedFeedbacks !== null ? totalDeletedFeedbacks.toLocaleString() : "—"}
          </span>
        </div>
      </div>

      {/* Email пользователя */}
      <div className="hidden md:flex flex-col">
        {user.name && <span className="text-sm font-medium">{user.name}</span>}
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>

      {/* Меню пользователя */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="relative h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-primary/20 hover:from-blue-600 hover:to-purple-700"
          >
            <span className="text-xs font-semibold text-white">{userInitials}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name || "Пользователь"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Настройки</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/billing">
              <Wallet className="mr-2 h-4 w-4" />
              <span>Биллинг</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? "Выход..." : "Выйти"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
