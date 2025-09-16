"use client"

import { cn } from "@/lib/utils"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Settings, AlertTriangle, Trash2, CheckCircle, X, RefreshCw, Loader2 } from "lucide-react"
import { useAccounts } from "@/lib/context/accounts-context"
import { useBalance } from "@/lib/context/balance-context"
import { apiClient } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { AddAccountDialog } from "@/components/add-account-dialog"

// Функция для определения статуса автоответов - исправлена для работы с API структурой
const getAutoResponseStatus = (account: any) => {
  if (!account.settings?.auto_responses?.marks) return false
  return Object.values(account.settings.auto_responses.marks).some((mark: any) => mark.enabled)
}

// Функция для определения статуса автосообщений - исправлена для работы с API структурой
const getAutoMessageStatus = (account: any) => {
  if (!account.settings?.auto_messages) return false

  // Проверяем оценки 1-4
  const relevantRatings = ["1", "2", "3", "4"]
  return Object.entries(account.settings.auto_messages)
    .filter(([rating]) => relevantRatings.includes(rating))
    .some(([_, message]: [string, any]) => message.enabled)
}

// Компонент скелетона для карточки аккаунта
function AccountCardSkeleton() {
  return (
    <Card className="hover-lift transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm items-center">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <div className="flex justify-between text-sm items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="w-full grid grid-cols-2 gap-2">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </CardFooter>
    </Card>
  )
}

export function AccountsList() {
  const { accounts, deleteAccount, isLoading, error, refreshAccounts } = useAccounts()
  const { updateBalanceFromData } = useBalance()
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (accountToDelete) {
      setDeletingAccountId(accountToDelete)
      console.log("Начинаем удаление аккаунта:", accountToDelete)

      const success = await deleteAccount(accountToDelete)
      console.log("Результат удаления:", success)

      if (success) {
        console.log("Аккаунт успешно удален, обновляем баланс...")
        // ОБНОВЛЯЕМ БАЛАНС И СРАЗУ ИСПОЛЬЗУЕМ ПОЛУЧЕННЫЕ ДАННЫЕ
        try {
          const balanceData = await apiClient.getUserBalance()
          console.log("✅ Получены данные баланса после удаления в списке:", balanceData)
          updateBalanceFromData(balanceData)
          console.log("✅ Баланс успешно обновлен после удаления в списке")
        } catch (error) {
          console.error("❌ Ошибка обновления баланса после удаления в списке:", error)
        }

        setAccountToDelete(null)
      }
      setDeletingAccountId(null)
    }
  }

  const handleRetry = () => {
    refreshAccounts()
  }

  // Показываем ошибку подключения
  if (error) {
    return (
      <div className="text-center py-12 border rounded-xl bg-white mx-2 sm:mx-0">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Ошибка загрузки аккаунтов</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto px-4">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRetry} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Повторить
              </>
            )}
          </Button>
          <AddAccountDialog>
            <Button variant="outline" className="rounded-lg bg-transparent">
              Добавить аккаунт
            </Button>
          </AddAccountDialog>
        </div>
      </div>
    )
  }

  // Показываем состояние загрузки
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 px-2 sm:px-0">
        {[...Array(6)].map((_, i) => (
          <AccountCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Показываем пустое состояние
  if (accounts.length === 0) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 px-2 sm:px-0">
        {/* Карточка для добавления нового аккаунта */}
        <AddAccountDialog>
          <Card className="hover-lift transition-all duration-300 border-dashed border-2 border-gray-300 hover:border-gray-400 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-center items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <PlusCircle className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3 text-center">
              <CardTitle className="text-base sm:text-lg text-gray-600 mb-2">Добавить аккаунт</CardTitle>
              <CardDescription className="text-sm">Подключите новый аккаунт Wildberries</CardDescription>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full text-center py-6 text-gray-400 text-sm">Нажмите для добавления</div>
            </CardFooter>
          </Card>
        </AddAccountDialog>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 px-2 sm:px-0">
      {/* Карточка для добавления нового аккаунта */}
      <AddAccountDialog>
        <Card className="hover-lift transition-all duration-300 border-dashed border-2 border-gray-300 hover:border-gray-400 cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <PlusCircle className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 text-center">
            <CardTitle className="text-base sm:text-lg text-gray-600 mb-2">Добавить аккаунт</CardTitle>
            <CardDescription className="text-sm">Подключите новый аккаунт Wildberries</CardDescription>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="w-full text-center py-6 text-gray-400 text-sm">Нажмите для добавления</div>
          </CardFooter>
        </Card>
      </AddAccountDialog>

      {accounts.map((account) => {
        const autoResponsesEnabled = getAutoResponseStatus(account)
        const autoMessagesEnabled = getAutoMessageStatus(account)

        return (
          <Card
            key={account.id}
            className={cn(
              "hover-lift transition-all duration-300",
              account.api_status && account.cookie_status ? "" : "border-red-200",
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">{account.name}</CardTitle>
                  <CardDescription className="text-sm truncate">
                    {account.store_name || "Название магазина не указано"}
                  </CardDescription>
                  {account.inn && <div className="text-xs text-gray-500 mt-1">ИНН: {account.inn}</div>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Link href={`/dashboard/accounts/${account.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => {
                      console.log("Delete button clicked for account:", account.id)
                      setAccountToDelete(account.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  {accountToDelete === account.id && (
                    <AlertDialog open={true} onOpenChange={(open) => !open && setAccountToDelete(null)}>
                      <AlertDialogContent className="rounded-lg mx-4 sm:mx-0">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удаление аккаунта</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить аккаунт "{account.name}"? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel
                            className="rounded-lg w-full sm:w-auto"
                            onClick={() => setAccountToDelete(null)}
                          >
                            Отмена
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 rounded-lg w-full sm:w-auto"
                            disabled={deletingAccountId === accountToDelete}
                          >
                            {deletingAccountId === accountToDelete ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Удаление...
                              </>
                            ) : (
                              "Удалить"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Кука:</span>
                  {account.cookie_status === null ? (
                    <Badge className="rounded-full h-6 w-6 p-0 flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-100">
                      <span className="text-xs">?</span>
                    </Badge>
                  ) : account.cookie_status ? (
                    <Badge className="rounded-full h-6 w-6 p-0 flex items-center justify-center bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge className="rounded-full h-6 w-6 p-0 flex items-center justify-center bg-red-100 text-red-800 hover:bg-red-100">
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">API ключ:</span>
                  {account.api_status === null ? (
                    <Badge className="rounded-full h-6 w-6 p-0 flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-100">
                      <span className="text-xs">?</span>
                    </Badge>
                  ) : account.api_status ? (
                    <Badge className="rounded-full h-6 w-6 p-0 flex items-center justify-center bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge className="rounded-full h-6 w-6 p-0 flex items-center justify-center bg-red-100 text-red-800 hover:bg-red-100">
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                </div>

                {!account.match_status && account.cookie_status && account.api_status && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">Несоответствие куки и API</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full grid grid-cols-2 gap-2">
                <div className={cn("text-center p-2 rounded-lg", autoResponsesEnabled ? "bg-green-50" : "bg-gray-50")}>
                  <div className="text-xs text-gray-500">Автоответы</div>
                  <div className={cn("font-medium text-sm", autoResponsesEnabled ? "text-green-700" : "text-gray-600")}>
                    {autoResponsesEnabled ? "Вкл." : "Выкл."}
                  </div>
                </div>
                <div className={cn("text-center p-2 rounded-lg", autoMessagesEnabled ? "bg-green-50" : "bg-gray-50")}>
                  <div className="text-xs text-gray-500">Автодиалоги</div>
                  <div className={cn("font-medium text-sm", autoMessagesEnabled ? "text-green-700" : "text-gray-600")}>
                    {autoMessagesEnabled ? "Вкл." : "Выкл."}
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
