"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, ChevronLeft, ChevronRight, AlertCircle, ExternalLink } from "lucide-react"
import { apiClient, type UserFeedbackItem, type UserFeedbacksFilters } from "@/lib/api"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface UserFeedbacksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  buyerId: number | null
  userName: string | null
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

// Компонент для отображения текста отзыва
function FeedbackText({ feedback }: { feedback: UserFeedbackItem }) {
  return (
    <div className="max-w-md space-y-2">
      {/* Достоинства */}
      {feedback.pros && (
        <div className="text-sm">
          <span className="font-medium text-gray-700">Достоинства:</span>{" "}
          <span className="text-gray-900">{feedback.pros}</span>
        </div>
      )}

      {/* Недостатки */}
      {feedback.cons && (
        <div className="text-sm">
          <span className="font-medium text-gray-700">Недостатки:</span>{" "}
          <span className="text-gray-900">{feedback.cons}</span>
        </div>
      )}

      {/* Основной комментарий */}
      {feedback.text && (
        <div className="text-sm">
          <span className="font-medium text-gray-700">Комментарий:</span>{" "}
          <span className="text-gray-900">{feedback.text}</span>
        </div>
      )}

      {/* Если нет текста вообще */}
      {!feedback.pros && !feedback.cons && !feedback.text && (
        <div className="text-sm text-gray-500">Без комментария</div>
      )}
    </div>
  )
}

// Компонент скелетона для таблицы
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-4 rounded-full" />
              ))}
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-1">
              <Skeleton className="h-4 w-full max-w-xs" />
              <Skeleton className="h-4 w-3/4 max-w-xs" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function UserFeedbacksDialog({ open, onOpenChange, buyerId, userName }: UserFeedbacksDialogProps) {
  const [feedbacks, setFeedbacks] = useState<UserFeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  const pageSize = 10

  const loadUserFeedbacks = useCallback(
    async (page = 1) => {
      if (buyerId === null) {
        setFeedbacks([])
        setTotal(0)
        setHasNext(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const offset = (page - 1) * pageSize
        const filters: UserFeedbacksFilters = {
          limit: pageSize,
          offset: offset,
        }
        const response = await apiClient.getUserFeedbacks(buyerId, filters)
        setFeedbacks(response.results)
        setTotal(response.total)
        setHasNext(response.has_next)
        setCurrentPage(page)
      } catch (err) {
        console.error("Ошибка при загрузке отзывов пользователя:", err)
        setError(err instanceof Error ? err.message : "Не удалось загрузить отзывы пользователя")
      } finally {
        setIsLoading(false)
      }
    },
    [buyerId, pageSize],
  ) // Добавил pageSize в зависимости useCallback

  useEffect(() => {
    if (open) {
      loadUserFeedbacks(1)
    }
  }, [open, buyerId, loadUserFeedbacks]) // Добавил loadUserFeedbacks в зависимости useEffect

  const handlePageChange = (page: number) => {
    loadUserFeedbacks(page)
  }

  const totalPages = Math.ceil(total / pageSize)

  const getPaginationPages = (currentPage: number, totalPages: number) => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7 // Total number of page buttons to show (including 1, ..., totalPages)

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor((maxVisiblePages - 3) / 2))
      const endPage = Math.min(totalPages, currentPage + Math.floor((maxVisiblePages - 3) / 2))

      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push("...")
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...")
        }
        pages.push(totalPages)
      }
    }
    return pages
  }

  const paginationPages = getPaginationPages(currentPage, totalPages)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Отзывы пользователя: {userName || "Неизвестно"}</DialogTitle>
          <DialogDescription>
            Все отзывы, оставленные пользователем {userName || "с этим ID"} (ID: {buyerId || "—"})
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-md mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
        <div className="overflow-y-auto flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Оценка</TableHead>
                <TableHead>Текст отзыва</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Продавец</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Отзывы не найдены
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks.map((feedback) => (
                  <TableRow key={feedback.feedback_id}>
                    <TableCell className="text-sm">
                      {format(new Date(feedback.created_date), "dd.MM.yyyy HH:mm", { locale: ru })}
                    </TableCell>
                    <TableCell>
                      <StarRating rating={feedback.product_valuation || 0} />
                    </TableCell>
                    <TableCell>
                      <FeedbackText feedback={feedback} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {feedback.nm_id ? (
                        <a
                          href={`https://www.wildberries.ru/catalog/${feedback.nm_id}/detail.aspx`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          {feedback.nm_id}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {feedback.product_name || "—"}
                      {feedback.product_brand && (
                        <span className="block text-xs text-gray-500">{feedback.product_brand}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {feedback.supplier_name && feedback.supplier_id ? (
                        <a
                          href={`https://www.wildberries.ru/seller/${feedback.supplier_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          {feedback.supplier_name}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {paginationPages.map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="text-sm text-gray-600">
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
