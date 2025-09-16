import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="container py-4 sm:py-8 px-4 lg:px-8">
      {/* Заголовок аккаунтов */}
      <Skeleton className="h-8 w-48 mb-4 sm:mb-6" />

      {/* Сетка аккаунтов */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 px-2 sm:px-0 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex justify-between items-start gap-2 mb-4">
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
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm items-center">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex justify-between text-sm items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-2">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Заголовок графика */}
      <Skeleton className="h-8 w-40 mb-4 sm:mb-6" />

      {/* График */}
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  )
}
