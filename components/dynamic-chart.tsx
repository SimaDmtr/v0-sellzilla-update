"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Динамический импорт FeedbackChart для оптимизации загрузки
const FeedbackChart = dynamic(
  () => import("@/components/feedback-chart").then((mod) => ({ default: mod.FeedbackChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
  },
)

export { FeedbackChart }
