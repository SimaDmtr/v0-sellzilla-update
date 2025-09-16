"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import type { ParentFeedback } from "@/lib/api" // Import the new type

interface OriginalReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentFeedback: ParentFeedback | null
}

// Reusing StarRating from reviews-table-content or review-details-dialog
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

export function OriginalReviewDialog({ open, onOpenChange, parentFeedback }: OriginalReviewDialogProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: ru })
    } catch {
      return dateString
    }
  }

  if (!parentFeedback) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Первоначальный отзыв</DialogTitle>
          <DialogDescription>Детали первоначального отзыва покупателя.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 text-sm">
          <p>
            <span className="font-medium">Дата:</span> {formatDate(parentFeedback.created_at)}
          </p>
          <p>
            <span className="font-medium">Оценка:</span> <StarRating rating={parentFeedback.valuation || 0} />
          </p>

          {parentFeedback.feedback_text_pros && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Достоинства:</h3>
              <p className="text-gray-700">{parentFeedback.feedback_text_pros}</p>
            </div>
          )}
          {parentFeedback.feedback_text_cons && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Недостатки:</h3>
              <p className="text-gray-700">{parentFeedback.feedback_text_cons}</p>
            </div>
          )}
          {parentFeedback.text && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Комментарий:</h3>
              <p className="text-gray-700">{parentFeedback.text}</p>
            </div>
          )}

          {parentFeedback.good_reasons?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Преимущества, которые отметил пользователь:</h3>
              <div className="flex flex-wrap gap-2">
                {parentFeedback.good_reasons.map((reason, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-100 cursor-default">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {parentFeedback.bad_reasons?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Недостатки, которые отметил пользователь:</h3>
              <div className="flex flex-wrap gap-2">
                {parentFeedback.bad_reasons.map((reason, index) => (
                  <Badge key={index} className="bg-red-100 text-red-800 hover:bg-red-100 cursor-default">
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
