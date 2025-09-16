"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, ThumbsDown, Calendar, Package, Store } from "lucide-react"
import type { ReviewHistory, LikeHistory } from "@/lib/types"

// Моковые данные для демонстрации
const mockReviews: ReviewHistory[] = [
  {
    id: "1",
    date: "2024-01-15",
    rating: 5,
    text: "Отличный товар, быстрая доставка!",
    articleId: "12345",
    productName: "Смартфон iPhone 15",
    brand: "Apple",
    storeName: "TechStore",
  },
  {
    id: "2",
    date: "2024-01-14",
    rating: 4,
    text: "Хорошее качество, рекомендую",
    articleId: "12346",
    productName: "Наушники AirPods",
    brand: "Apple",
    storeName: "TechStore",
  },
  {
    id: "3",
    date: "2024-01-13",
    rating: 3,
    text: "Средне, есть недостатки",
    articleId: "12347",
    productName: "Чехол для телефона",
    brand: "Generic",
    storeName: "AccessoryShop",
  },
]

const mockLikes: LikeHistory[] = [
  {
    id: "1",
    date: "2024-01-15",
    type: "like",
    articleId: "12345",
    productName: "Смартфон iPhone 15",
    brand: "Apple",
    storeName: "TechStore",
  },
  {
    id: "2",
    date: "2024-01-14",
    type: "dislike",
    articleId: "12346",
    productName: "Наушники AirPods",
    brand: "Apple",
    storeName: "TechStore",
  },
]

interface ReviewsAndLikesDialogProps {
  trigger: React.ReactNode
}

export function ReviewsAndLikesDialog({ trigger }: ReviewsAndLikesDialogProps) {
  const [open, setOpen] = useState(false)

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "text-red-500"
    if (rating === 3) return "text-yellow-500"
    return "text-green-500"
  }

  const getRatingBadgeColor = (rating: number) => {
    if (rating <= 2) return "bg-red-100 text-red-800"
    if (rating === 3) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>История отзывов и лайков</DialogTitle>
          <DialogDescription>Просмотр всех отзывов и лайков за выбранный период</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">Отзывы ({mockReviews.length})</TabsTrigger>
            <TabsTrigger value="likes">Лайки ({mockLikes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4">
            {mockReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? `fill-current ${getRatingColor(review.rating)}` : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge className={getRatingBadgeColor(review.rating)}>{review.rating} ★</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(review.date).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{review.text}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{review.productName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      <span>{review.storeName}</span>
                    </div>
                    <div>
                      <span className="font-medium">Артикул:</span> {review.articleId}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="likes" className="space-y-4">
            {mockLikes.map((like) => (
              <Card key={like.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {like.type === "like" ? (
                        <ThumbsUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={like.type === "like" ? "default" : "destructive"}>
                        {like.type === "like" ? "Лайк" : "Дизлайк"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(like.date).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{like.productName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      <span>{like.storeName}</span>
                    </div>
                    <div>
                      <span className="font-medium">Артикул:</span> {like.articleId}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
