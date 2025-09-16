"use client"

import type React from "react"
import { memo, useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserFeedbacksDialog } from "@/components/user-feedbacks-dialog"
import { OriginalReviewDialog } from "@/components/original-review-dialog"
import type { FeedbackItem, ParentFeedback, ComplaintReason } from "@/lib/api"
import { apiClient } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { useAuth } from "@/lib/context/auth-context"
import Link from "next/link"
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Eye,
  Copy,
  AlertCircle,
  MoreHorizontal,
  Flag,
  CreditCard,
} from "lucide-react"
import type { HTMLDivElement } from "react"

// Функция для безопасного форматирования цены
function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) {
    return "—"
  }
  return `${price.toFixed(0)} ₽`
}

// Функция для получения цвета статуса
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "новый":
      return "bg-blue-100 text-blue-800"
    case "ожидание":
      return "bg-yellow-100 text-yellow-800"
    case "отказ":
      return "bg-red-100 text-red-800"
    case "удалён":
      return "bg-gray-300 text-gray-600" // Блеклый цвет
    case "вернули оплату":
      return "bg-green-300 text-green-700" // Блеклый зеленый
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Функция для получения цвета выкупа
function getBuyoutColor(trustFactor: string): string {
  switch (trustFactor.toLowerCase()) {
    case "buyout":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "returned": // Added for "Возврат"
      return "bg-gray-100 text-gray-800" // Default gray, as no specific color was requested
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Функция для получения текста выкупа
function getBuyoutText(trustFactor: string): string {
  switch (trustFactor.toLowerCase()) {
    case "buyout":
      return "Выкуп"
    case "rejected":
      return "Отказ"
    case "returned": // Added for "Возврат"
      return "Возврат"
    default:
      return trustFactor
  }
}

// Компонент звездного рейтинга
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < (rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

// Компонент для отображения имени покупателя с popover для buyer_id, rid и даты регистрации
function BuyerName({
  userName,
  buyerId,
  rid,
  registerDate,
  chatId,
  phone,
  feedback,
}: {
  userName: string | null
  buyerId: number | null
  rid: string | null
  registerDate: string | null
  chatId: string | null
  phone: number | null
  feedback: FeedbackItem
}) {
  const { user } = useAuth()
  const displayName = userName || "—"

  // Проверяем права на просмотр данных покупателя
  const canViewBuyerData = user?.features?.can_view_buyer_data ?? false

  // Function to format phone number for URLs
  const formatPhoneNumber = (num: number | null) => {
    if (num === null) return ""
    // Assuming the number is always 11 digits starting with 7
    return num.toString()
  }

  const formattedPhone = formatPhoneNumber(phone)

  // Функция для копирования в буфер обмена
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Скопировано",
        description: `${label} "${text}" скопирован в буфер обмена.`,
      })
    } catch (err) {
      console.error("Ошибка при копировании:", err)
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать в буфер обмена.",
        variant: "destructive",
      })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="text-sm cursor-pointer underline decoration-dotted">{displayName}</span>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-1 w-auto">
        {canViewBuyerData ? (
          <>
            <div className="flex items-center gap-2">
              <p>ID отзыва: {feedback.id}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(feedback.id, "ID отзыва")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            {buyerId !== null && (
              <div className="flex items-center gap-2">
                <p>ID покупателя: {buyerId}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(buyerId.toString(), "ID покупателя")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            {rid !== null && (
              <div className="flex items-center gap-2">
                <p>RID: {rid}</p>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(rid, "RID")}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            {registerDate && (
              <div className="flex items-center gap-2">
                <p>Дата регистрации: {formatDate(registerDate)}</p>
              </div>
            )}
            {(chatId || (phone && canViewBuyerData)) && (
              <div className="flex items-center gap-2">
                <p>Контакты:</p>
                {chatId && (
                  <a
                    href={`https://seller.wildberries.ru/chat-with-clients?chatId=${chatId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-bold text-lg"
                    style={{
                      background: "linear-gradient(45deg, #9B00E8, #D600FF)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    WB
                  </a>
                )}
                {formattedPhone && canViewBuyerData && (
                  <>
                    <a
                      href={`https://t.me/+${formattedPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                      title="Telegram"
                    >
                      <img src="/images/telegram.svg" alt="Telegram" className="h-5 w-5" />
                    </a>
                    <a
                      href={`viber://chat?number=%2B${formattedPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                      title="Viber"
                    >
                      <img src="/images/viber.svg" alt="Viber" className="h-5 w-5" />
                    </a>
                    <a
                      href={`https://wa.me/${formattedPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                      title="WhatsApp"
                    >
                      <img src="/images/whatsapp.svg" alt="WhatsApp" className="h-5 w-5" />
                    </a>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-3 py-4 px-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Расширенная информация</h4>
              <p className="text-xs text-gray-600">
                Расширенная информация о клиенте и отзыве доступна при пополнении баланса
              </p>
            </div>
            <Link href="/dashboard/billing">
              <Button size="sm" className="text-xs">
                Пополнить баланс
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Компонент для отображения количества отзывов с кнопкой просмотра
function TotalFeedbacks({
  totalFeedbacks,
  buyerId,
  userName,
}: {
  totalFeedbacks: number | null
  buyerId: number | null
  userName: string | null
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (totalFeedbacks === null || buyerId === null) {
    return <span className="text-sm">—</span>
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{totalFeedbacks}</span>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100" onClick={() => setDialogOpen(true)}>
        <Eye className="h-4 w-4 text-gray-600" />
      </Button>

      <UserFeedbacksDialog open={dialogOpen} onOpenChange={setDialogOpen} buyerId={buyerId} userName={userName} />
    </div>
  )
}

// Компонент объединенного текста отзыва с правильным форматированием и выкупом
function ReviewText({
  feedback,
  onComplaintClick,
}: {
  feedback: FeedbackItem
  onComplaintClick: (feedback: FeedbackItem) => void
}) {
  const hasReviewContent =
    feedback.feedback_text_pros ||
    feedback.feedback_text_cons ||
    feedback.text ||
    (feedback.good_reasons && feedback.good_reasons.length > 0) ||
    (feedback.bad_reasons && feedback.bad_reasons.length > 0)

  return (
    <div className="max-w-md space-y-3 relative">
      {/* Меню действий - показываем всегда */}
      <div className="absolute top-0 right-0 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onComplaintClick(feedback)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Flag className="h-4 w-4" />
              Пожаловаться на отзыв
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Отступ справа чтобы текст не перекрывался с кнопкой */}
      <div className="pr-6">
        {!hasReviewContent && <span className="text-gray-500">—</span>}

        {/* Достоинства */}
        {feedback.feedback_text_pros && (
          <div className="space-y-1">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Достоинства:</span>{" "}
              <span className="text-gray-900">{feedback.feedback_text_pros}</span>
            </div>
          </div>
        )}

        {/* Недостатки */}
        {feedback.feedback_text_cons && (
          <div className="space-y-1">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Недостатки:</span>{" "}
              <span className="text-gray-900">{feedback.feedback_text_cons}</span>
            </div>
          </div>
        )}

        {/* Основной комментарий */}
        {feedback.text && (
          <div className="space-y-1">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Комментарий:</span>{" "}
              <span className="text-gray-900">{feedback.text}</span>
            </div>
          </div>
        )}

        {/* Преимущества, которые отметил пользователь */}
        {feedback.good_reasons?.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Преимущества, которые отметил пользователь:</div>
            <div className="flex flex-wrap gap-1">
              {feedback.good_reasons.map((reason, index) => (
                <Badge
                  key={index}
                  className="bg-green-100 text-green-800 text-xs px-2 py-1 font-normal rounded-sm pointer-events-none"
                >
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Недостатки, которые отметил пользователь */}
        {feedback.bad_reasons?.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Недостатки, которые отметил пользователь:</div>
            <div className="flex flex-wrap gap-1">
              {feedback.bad_reasons.map((reason, index) => (
                <Badge
                  key={index}
                  className="bg-red-100 text-red-800 text-xs px-2 py-1 font-normal rounded-sm pointer-events-none"
                >
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(feedback.trust_factor && feedback.trust_factor !== "—") ||
        (feedback.exclude_from_rating && feedback.exclude_from_rating !== "") ||
        feedback.is_hidden ||
        feedback.complaint_feedback_status ? (
          <div className="pt-2 flex flex-wrap gap-1 items-center">
            {feedback.trust_factor && feedback.trust_factor !== "—" && (
              <Badge className={`${getBuyoutColor(feedback.trust_factor)} pointer-events-none`}>
                {getBuyoutText(feedback.trust_factor)}
              </Badge>
            )}
            {feedback.exclude_from_rating && feedback.exclude_from_rating !== "" && (
              <Badge className="bg-gray-200 text-gray-800 pointer-events-none">Исключён из рейтинга</Badge>
            )}
            {feedback.is_hidden && <Badge className="bg-gray-200 text-gray-800 pointer-events-none">Скрыт</Badge>}
            {feedback.complaint_feedback_status === "approved" && (
              <Badge className="bg-green-100 text-green-800 pointer-events-none">Жалоба одобрена</Badge>
            )}
            {feedback.complaint_feedback_status === "rejected" && (
              <Badge className="bg-gray-200 text-gray-800 pointer-events-none">Жалоба отклонена</Badge>
            )}
            {feedback.complaint_feedback_status === "review" && (
              <Badge className="bg-gray-200 text-gray-800 pointer-events-none">Проверяем жалобу</Badge>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

// Компонент модального окна жалобы с проверкой прав доступа
function ComplaintDialog({
  open,
  onOpenChange,
  complaintText,
  onComplaintTextChange,
  selectedReason,
  onReasonChange,
  reasons,
  onSubmit,
  isLoading,
  isLoadingComplaint,
  selectedFeedback,
  canComplain = true,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  complaintText: string
  onComplaintTextChange: (text: string) => void
  selectedReason: number | null
  onReasonChange: (reasonId: number) => void
  reasons: ComplaintReason[]
  onSubmit: () => void
  isLoading: boolean
  isLoadingComplaint: boolean
  selectedFeedback: FeedbackItem | null
  canComplain?: boolean
}) {
  // Проверяем, есть ли уже статус жалобы
  const hasExistingComplaint =
    selectedFeedback?.complaint_feedback_status && selectedFeedback.complaint_feedback_status !== "unknown"

  // Функция для получения текста кнопки в зависимости от статуса
  const getButtonText = () => {
    if (!canComplain) return "Пополнить баланс"
    if (!hasExistingComplaint) return "Отправить"

    switch (selectedFeedback?.complaint_feedback_status) {
      case "approved":
        return "Жалоба одобрена"
      case "rejected":
        return "Жалоба отклонена"
      case "review":
        return "Проверяем жалобу"
      default:
        return "Жалоба подана"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{!canComplain ? "Расширенные функции" : "Что не так с отзывом"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!canComplain ? (
            // Блок для пользователей без доступа к жалобам
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Подача жалоб доступна в расширенной версии</h3>
                <p className="text-gray-600">
                  Пополните баланс для доступа к функции подачи жалоб на отзывы и другим расширенным возможностям.
                </p>
              </div>
            </div>
          ) : (
            // Обычный интерфейс жалобы
            <>
              {/* Выпадающий список причин */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Причина жалобы</label>
                <Select
                  value={selectedReason?.toString() || ""}
                  onValueChange={(value) => onReasonChange(Number.parseInt(value))}
                  disabled={isLoading || isLoadingComplaint || hasExistingComplaint}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите причину..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons.map((reason) => (
                      <SelectItem key={reason.id} value={reason.id.toString()}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Textarea с текстом жалобы */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Описание проблемы</label>
                <div className="relative">
                  <Textarea
                    value={complaintText}
                    onChange={(e) => onComplaintTextChange(e.target.value)}
                    placeholder="Опишите проблему с отзывом..."
                    className="min-h-[200px] resize-none"
                    disabled={isLoading || hasExistingComplaint}
                    readOnly={hasExistingComplaint}
                  />
                  {isLoadingComplaint && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Загружаем текст жалобы...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Отмена
          </Button>
          {!canComplain ? (
            <Link href="/dashboard/billing">
              <Button className="gap-2">
                <CreditCard className="h-4 w-4" />
                Пополнить баланс
              </Button>
            </Link>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={hasExistingComplaint || isLoading || !complaintText.trim() || !selectedReason}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                getButtonText()
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Компонент выпадающего списка статуса
function StatusSelect({
  feedback,
  onStatusChange,
}: {
  feedback: FeedbackItem
  onStatusChange: (feedbackId: string, newStatus: string) => Promise<void>
}) {
  const [isUpdating, setIsUpdating] = useState(false)

  const statusOptions = [
    { value: "Новый", label: "Новый" },
    { value: "Ожидание", label: "Ожидание" },
    { value: "Отказ", label: "Отказ" },
    { value: "Удалён", label: "Удалён" },
    { value: "Вернули оплату", label: "Вернули оплату" },
  ]

  // Функция для проверки доступности статуса
  const isStatusDisabled = (newStatus: string) => {
    const currentStatus = feedback.status

    // Если текущий статус "Удалён", можно сменить только на "Вернули оплату"
    if (currentStatus === "Удалён" && newStatus !== "Вернули оплату" && newStatus !== "Удалён") {
      return true
    }

    // Если текущий статус "Вернули оплату", можно сменить только на "Удалён"
    if (currentStatus === "Вернули оплату" && newStatus !== "Удалён" && newStatus !== "Вернули оплату") {
      return true
    }

    return false
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === feedback.status || isUpdating) return

    setIsUpdating(true)
    try {
      await onStatusChange(feedback.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select value={feedback.status} onValueChange={handleStatusChange} disabled={isUpdating}>
      <SelectTrigger className="w-full min-w-[120px]" disabled={isUpdating}>
        {isUpdating ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs">Обновление...</span>
          </div>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => {
          const isDisabled = isStatusDisabled(option.value)
          return (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={isDisabled}
              className={isDisabled ? "text-gray-400 opacity-50" : ""}
            >
              {option.label}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

// Компонент пагинации
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  isLoading,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNext: boolean
  hasPrev: boolean
  isLoading: boolean
}) {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev || isLoading}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getVisiblePages().map((page, index) => (
        <div key={index}>
          {page === "..." ? (
            <span className="px-2 text-gray-500">...</span>
          ) : (
            <Button
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              disabled={isLoading}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext || isLoading}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Компонент заголовка колонки с сортировкой
function SortableHeader({
  children,
  sortKey,
  currentSort,
  onSort,
}: {
  children: React.ReactNode
  sortKey: string
  currentSort: { field?: string; direction?: "asc" | "desc" }
  onSort: (field: string) => void
}) {
  const isActive = currentSort.field === sortKey
  const direction = isActive ? currentSort.direction : undefined

  return (
    <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent" onClick={() => onSort(sortKey)}>
      <span className="flex items-center gap-1">
        {children}
        {isActive ? (
          direction === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </span>
    </Button>
  )
}

// Компонент скелетона для таблицы
function TableSkeleton() {
  return (
    <>
      {[...Array(10)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-20 animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-4 rounded-full animate-pulse" />
              ))}
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 animate-pulse" /> {/* Product Name */}
              <Skeleton className="h-3 w-20 animate-pulse" /> {/* Brand */}
              <Skeleton className="h-3 w-24 animate-pulse" /> {/* Article */}
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-md animate-pulse" />
              <Skeleton className="h-3 w-3/4 max-w-md animate-pulse" />
              <Skeleton className="h-6 w-16 rounded-full animate-pulse" /> {/* For Buyout badge */}
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20 animate-pulse" /> {/* For Buyer Name */}
              <Skeleton className="h-3 w-16 animate-pulse" /> {/* For Buyer ID/RID/Register Date in tooltip */}
            </div>
          </TableCell>
          <TableCell className="text-sm">
            <Skeleton className="h-4 w-12 animate-pulse" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-24 rounded animate-pulse" />
          </TableCell>
          <TableCell className="text-sm">{/* For Store Name */}</TableCell>
          <TableCell className="text-sm max-w-[150px] truncate" title="—">
            {/* For PVZ */}
          </TableCell>
          <TableCell className="text-sm text-center">
            <Skeleton className="h-4 w-8 animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-8 animate-pulse" />
              <Skeleton className="h-6 w-6 rounded animate-pulse" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// Форматирование даты
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd.MM.yyyy", { locale: ru })
  } catch {
    return dateString
  }
}

interface ReviewsTableContentProps {
  feedbacks: FeedbackItem[]
  isLoading: boolean
  error: string | null
  total: number
  pageSize: number
  currentPage: number
  totalPages: number
  currentSort: { field?: string; direction?: "asc" | "desc" }
  onStatusChange: (feedbackId: string, newStatus: string) => Promise<void>
  onPageChange: (page: number) => void
  onSort: (field: string) => void
  onPageSizeChange: (size: number) => void // New prop for page size change
}

export const ReviewsTableContent = memo(function ReviewsTableContent({
  feedbacks = [], // Default to empty array to prevent undefined.length error
  isLoading,
  error,
  total,
  pageSize,
  currentPage,
  totalPages,
  currentSort,
  onStatusChange,
  onPageChange,
  onSort,
  onPageSizeChange, // Destructure new prop
}: ReviewsTableContentProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null) // Добавлено useRef
  const [originalReviewDialogOpen, setOriginalReviewDialogOpen] = useState(false)
  const [selectedParentFeedback, setSelectedParentFeedback] = useState<ParentFeedback | null>(null)

  // Получаем данные пользователя для проверки прав доступа
  const { user } = useAuth()

  // Состояния для жалобы
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false)
  const [complaintText, setComplaintText] = useState("")
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [selectedReason, setSelectedReason] = useState<number | null>(null)
  const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>([])
  const [isComplaintLoading, setIsComplaintLoading] = useState(false)
  const [isLoadingComplaint, setIsLoadingComplaint] = useState(false)

  // Проверяем права доступа к жалобам
  const canComplain = user?.features?.can_complain ?? false

  // Добавлено useEffect для прокрутки к началу таблицы при изменении страницы ИЛИ размера страницы
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [currentPage, pageSize]) // Добавлен pageSize в зависимости

  const handleOpenOriginalReview = (parentFeedback: ParentFeedback) => {
    setSelectedParentFeedback(parentFeedback)
    setOriginalReviewDialogOpen(true)
  }

  // Обработчик клика по кнопке жалобы - теперь с проверкой прав доступа
  const handleComplaintClick = async (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback)
    setComplaintText("") // Сброс текста
    setSelectedReason(null) // Сброс причины
    setComplaintReasons([]) // Сброс списка причин
    setComplaintDialogOpen(true) // Открываем окно сразу

    // Если нет прав на жалобы, показываем предложение пополнить баланс
    if (!canComplain) {
      setIsLoadingComplaint(false)
      return
    }

    // Проверяем, есть ли уже статус жалобы (не "unknown")
    const hasExistingComplaint = feedback.complaint_feedback_status && feedback.complaint_feedback_status !== "unknown"

    if (hasExistingComplaint) {
      // Если жалоба уже подана, используем существующие данные
      setComplaintText(feedback.complaint_feedback_explanation || "")

      // Создаем единственную причину из complaint_feedback_text
      const singleReason: ComplaintReason = {
        id: 1,
        label: feedback.complaint_feedback_text || "Жалоба подана",
      }
      setComplaintReasons([singleReason])
      setSelectedReason(1) // Автоматически выбираем единственную причину
      setIsLoadingComplaint(false)
      return
    }

    // Если жалобы еще нет, загружаем данные через API
    setIsLoadingComplaint(true)

    try {
      const response = await apiClient.makeComplaint(feedback)
      setComplaintText(response.compliant_text || "")
      setSelectedReason(response.ai_reason_id || null)
      setComplaintReasons(response.reasons || [])
    } catch (error) {
      console.error("Ошибка при получении текста жалобы:", error)

      let errorMessage = "Не удалось загрузить текст жалобы"

      if (error instanceof Error) {
        // Проверяем специфичные типы ошибок
        if (error.message.includes("404")) {
          errorMessage = "Функция жалоб временно недоступна"
        } else if (error.message.includes("403")) {
          errorMessage = "У вас нет прав для подачи жалоб"
        } else if (error.message.includes("500")) {
          errorMessage = "Ошибка сервера. Попробуйте позже"
        } else if (error.message.includes("Network")) {
          errorMessage = "Проблемы с подключением к серверу"
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      })

      // При ошибке закрываем окно
      setComplaintDialogOpen(false)
      setSelectedFeedback(null)
    } finally {
      setIsLoadingComplaint(false)
    }
  }

  // Обработчик отправки жалобы
  const handleSubmitComplaint = async () => {
    if (!selectedFeedback || !complaintText.trim() || !selectedReason) return

    setIsComplaintLoading(true)

    try {
      const response = await apiClient.sendComplaint(
        selectedFeedback.id,
        selectedFeedback.sid, // Передаем актуальный sid из отзыва
        selectedReason,
        complaintText.trim(),
      )

      // Проверяем успешность по полю success
      if (response.success === true) {
        toast({
          title: "Успешно",
          description: response.message || "Жалоба успешно отправлена",
        })
        setComplaintDialogOpen(false)
        setComplaintText("")
        setSelectedReason(null)
        setComplaintReasons([])
        setSelectedFeedback(null)
      } else {
        // Если success: false, показываем сообщение об ошибке
        toast({
          title: "Ошибка",
          description: response.message || "Не удалось отправить жалобу",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Ошибка при отправке жалобы:", error)

      let errorMessage = "Не удалось отправить жалобу"

      if (error instanceof Error) {
        // Используем сообщение из ошибки (которое может прийти от API)
        errorMessage = error.message

        // Дополнительная обработка специфичных ошибок
        if (error.message.includes("404")) {
          errorMessage = "Функция подачи жалоб временно недоступна"
        } else if (error.message.includes("403")) {
          errorMessage = "У вас нет прав для подачи жалоб"
        } else if (error.message.includes("429")) {
          errorMessage = "Слишком много запросов. Попробуйте позже"
        } else if (error.message.includes("500")) {
          errorMessage = "Ошибка сервера. Попробуйте позже"
        } else if (error.message.includes("Network")) {
          errorMessage = "Проблемы с подключением к серверу"
        } else if (error.message.includes("already exists")) {
          errorMessage = "Жалоба на этот отзыв уже была подана ранее"
        }
      }

      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsComplaintLoading(false)
    }
  }

  // Мгновенное закрытие модального окна без задержек
  const handleComplaintDialogChange = (open: boolean) => {
    if (!open) {
      // Мгновенно сбрасываем все состояния
      setComplaintDialogOpen(false)
      setComplaintText("")
      setSelectedReason(null)
      setComplaintReasons([])
      setSelectedFeedback(null)
      setIsLoadingComplaint(false)
      setIsComplaintLoading(false)
    } else {
      setComplaintDialogOpen(true)
    }
  }

  return (
    <Card ref={tableContainerRef}>
      <CardContent className="p-0">
        {error && (
          <div className="p-6 border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <SortableHeader sortKey="created_at" currentSort={currentSort} onSort={onSort}>
                    Дата
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[80px]">
                  <SortableHeader sortKey="valuation" currentSort={currentSort} onSort={onSort}>
                    Оценка
                  </SortableHeader>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <SortableHeader sortKey="product_name" currentSort={currentSort} onSort={onSort}>
                    Товар
                  </SortableHeader>
                </TableHead>
                <TableHead className="min-w-[300px]">Отзыв</TableHead>
                <TableHead className="w-[120px]">
                  <SortableHeader sortKey="user_name" currentSort={currentSort} onSort={onSort}>
                    Покупатель
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[100px]">
                  <SortableHeader sortKey="price" currentSort={currentSort} onSort={onSort}>
                    Цена
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[140px]">
                  <SortableHeader sortKey="status" currentSort={currentSort} onSort={onSort}>
                    Статус
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[150px]">
                  <SortableHeader sortKey="store_name" currentSort={currentSort} onSort={onSort}>
                    Магазин
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[150px]">
                  <SortableHeader sortKey="pvz" currentSort={currentSort} onSort={onSort}>
                    Пункт выдачи
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[60px]">
                  <SortableHeader sortKey="positive_count" currentSort={currentSort} onSort={onSort}>
                    Положительных
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[60px]">
                  <SortableHeader sortKey="negative_count" currentSort={currentSort} onSort={onSort}>
                    Негативных
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[80px]">
                  <SortableHeader sortKey="total_feedbacks" currentSort={currentSort} onSort={onSort}>
                    Отзывы
                  </SortableHeader>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12}>
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <img src="/images/man.svg" alt="No reviews found" className="w-48 h-48 mb-4" />
                      <p className="text-lg font-medium">Отзывы не найдены</p>
                      <p className="text-sm text-gray-600">Попробуйте изменить фильтры или добавить аккаунт.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks.map((feedback) => (
                  <TableRow key={feedback.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm">{formatDate(feedback.created_at)}</TableCell>
                    <TableCell>
                      <StarRating rating={feedback.valuation || 0} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm line-clamp-2">{feedback.product_name || "—"}</div>
                        <div className="text-xs text-gray-500">{feedback.brand || "—"}</div>
                        <a
                          href={`https://www.wildberries.ru/catalog/${feedback.wb_article}/detail.aspx`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-xs"
                        >
                          Арт.: {feedback.wb_article}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ReviewText feedback={feedback} onComplaintClick={handleComplaintClick} />
                      {feedback.parent_feedback && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs h-7 bg-transparent"
                          onClick={() => handleOpenOriginalReview(feedback.parent_feedback!)}
                        >
                          Первоначальный отзыв
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <BuyerName
                        userName={feedback.user_name}
                        buyerId={feedback.buyer_id}
                        rid={feedback.rid}
                        registerDate={feedback.register_date}
                        chatId={feedback.chat_id}
                        phone={feedback.phone}
                        feedback={feedback}
                      />
                    </TableCell>
                    <TableCell className="text-sm">{formatPrice(feedback.price)}</TableCell>
                    <TableCell>
                      <StatusSelect feedback={feedback} onStatusChange={onStatusChange} />
                    </TableCell>
                    <TableCell className="text-sm">{feedback.store_name || "—"}</TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={feedback.pvz || "—"}>
                      {feedback.pvz || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-center">
                      {feedback.positive_count !== null ? feedback.positive_count : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-center">
                      {feedback.negative_count !== null ? feedback.negative_count : "—"}
                    </TableCell>
                    <TableCell>
                      <TotalFeedbacks
                        totalFeedbacks={feedback.total_feedbacks}
                        buyerId={feedback.buyer_id}
                        userName={feedback.user_name}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Информация о количестве записей и пагинация */}
        {!isLoading && (
          <div className="p-6 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Показано {feedbacks.length} из {total} отзывов
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Размер страницы:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => onPageSizeChange(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                  hasNext={currentPage < totalPages}
                  hasPrev={currentPage > 1}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Диалог первоначального отзыва */}
      <OriginalReviewDialog
        open={originalReviewDialogOpen}
        onOpenChange={setOriginalReviewDialogOpen}
        parentFeedback={selectedParentFeedback}
      />

      {/* Диалог жалобы */}
      <ComplaintDialog
        open={complaintDialogOpen}
        onOpenChange={handleComplaintDialogChange}
        complaintText={complaintText}
        onComplaintTextChange={setComplaintText}
        selectedReason={selectedReason}
        onReasonChange={setSelectedReason}
        reasons={complaintReasons}
        onSubmit={handleSubmitComplaint}
        isLoading={isComplaintLoading}
        isLoadingComplaint={isLoadingComplaint}
        selectedFeedback={selectedFeedback}
        canComplain={canComplain}
      />
    </Card>
  )
})
