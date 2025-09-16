"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Star, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import type { FeedbackItem } from "@/lib/api" // Импортируем FeedbackItem из lib/api.ts

interface ReviewDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback: FeedbackItem | null
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

// Функция для получения цвета выкупа
function getBuyoutColor(trustFactor: string): string {
  switch (trustFactor.toLowerCase()) {
    case "buyout":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
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
    default:
      return trustFactor
  }
}

// Компонент скелетона для таблицы
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-4 rounded-full" />
              ))}
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function ReviewDetailsDialog({ open, onOpenChange, feedback }: ReviewDetailsDialogProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: ru })
    } catch {
      return dateString
    }
  }

  if (!feedback) {
    return null // Или можно отобразить Skeleton/Loading state
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Детали отзыва</DialogTitle>
          <DialogDescription>Подробная информация об отзыве.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p>
              <span className="font-medium">Дата:</span> {formatDate(feedback.created_at)}
            </p>
            <p>
              <span className="font-medium">Оценка:</span> <StarRating rating={feedback.valuation || 0} />
            </p>
            <p>
              <span className="font-medium">Артикул WB:</span>{" "}
              {feedback.wb_article ? (
                <a
                  href={`https://www.wildberries.ru/catalog/${feedback.wb_article}/detail.aspx`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  {feedback.wb_article}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              ) : (
                "—"
              )}
            </p>
            <p>
              <span className="font-medium">Товар:</span> {feedback.product_name || "—"}
            </p>
            <p>
              <span className="font-medium">Бренд:</span> {feedback.brand || "—"}
            </p>
            <p>
              <span className="font-medium">Покупатель:</span> {feedback.user_name || "—"} (ID:{" "}
              {feedback.buyer_id || "—"})
            </p>
            <p>
              <span className="font-medium">RID:</span> {feedback.rid || "—"}
            </p>
            <p>
              <span className="font-medium">Цена:</span> {feedback.price !== null ? `${feedback.price} ₽` : "—"}
            </p>
          </div>

          <div className="space-y-2">
            <p>
              <span className="font-medium">Магазин:</span> {feedback.store_name || "—"}
            </p>
            <p>
              <span className="font-medium">Пункт выдачи:</span> {feedback.pvz || "—"}
            </p>
            <p>
              <span className="font-medium">Дата регистрации:</span> {formatDate(feedback.register_date)}
            </p>
            <p>
              <span className="font-medium">Положительных оценок:</span>{" "}
              {feedback.positive_count !== null ? feedback.positive_count : "—"}
            </p>
            <p>
              <span className="font-medium">Отрицательных оценок:</span>{" "}
              {feedback.negative_count !== null ? feedback.negative_count : "—"}
            </p>
            <p>
              <span className="font-medium">Всего отзывов покупателя:</span>{" "}
              {feedback.total_feedbacks !== null ? feedback.total_feedbacks : "—"}
            </p>
            <p>
              <span className="font-medium">Выкуп:</span>{" "}
              <Badge
                className={`${getBuyoutColor(feedback.trust_factor || "")} hover:${getBuyoutColor(feedback.trust_factor || "")} cursor-default`}
              >
                {getBuyoutText(feedback.trust_factor || "")}
              </Badge>
            </p>
            <p>
              <span className="font-medium">Статус:</span>{" "}
              <Badge
                className={`${getBuyoutColor(feedback.status || "")} hover:${getBuyoutColor(feedback.status || "")} cursor-default`}
              >
                {feedback.status || "—"}
              </Badge>
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {feedback.feedback_text_pros && (
            <div>
              <h3 className="font-semibold text-base">Достоинства:</h3>
              <p className="text-gray-700">{feedback.feedback_text_pros}</p>
            </div>
          )}
          {feedback.feedback_text_cons && (
            <div>
              <h3 className="font-semibold text-base">Недостатки:</h3>
              <p className="text-gray-700">{feedback.feedback_text_cons}</p>
            </div>
          )}
          {feedback.text && (
            <div>
              <h3 className="font-semibold text-base">Комментарий:</h3>
              <p className="text-gray-700">{feedback.text}</p>
            </div>
          )}

          {feedback.good_reasons?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Преимущества, которые отметил пользователь:</h3>
              <div className="flex flex-wrap gap-2">
                {feedback.good_reasons.map((reason, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {feedback.bad_reasons?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Недостатки, которые отметил пользователь:</h3>
              <div className="flex flex-wrap gap-2">
                {feedback.bad_reasons.map((reason, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
