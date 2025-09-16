"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { useFeedbacks } from "@/lib/context/feedbacks-context"
import { useAccounts } from "@/lib/context/accounts-context"
import { useAuth } from "@/lib/context/auth-context"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Search, Filter, CalendarIcon, ChevronDown, RefreshCw, XCircle, Star } from "lucide-react"
import { ReviewsTableContent } from "@/components/reviews-table-content"
import { cn } from "@/lib/utils"
import type { FeedbacksFilters } from "@/lib/api"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import type { DateRange } from "react-day-picker"

export default function ReviewsPage() {
  const {
    feedbacks,
    isLoading,
    error,
    total,
    filters,
    pageSize,
    setFilters,
    setPageSize,
    refreshFeedbacks,
    updateFeedbackStatus,
  } = useFeedbacks()
  const { accounts, isLoading: accountsLoading, error: accountsError } = useAccounts()
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [uiSearchTerm, setUiSearchTerm] = useState(searchParams.get("product_name") || "")
  const [uiSelectedStore, setUiSelectedStore] = useState<string>(searchParams.get("store_name") || "all")
  const [uiSelectedRating, setUiSelectedRating] = useState<string[]>(
    searchParams.get("valuation")?.split(",").filter(Boolean) || [],
  )
  const [uiSelectedStatus, setUiSelectedStatus] = useState<string>(searchParams.get("status") || "all")
  const [uiSelectedTrustFactor, setUiSelectedTrustFactor] = useState<string>(searchParams.get("trust_factor") || "all")
  const [uiCustomerName, setUiCustomerName] = useState(searchParams.get("user_name") || "")
  const [uiReviewText, setUiReviewText] = useState(searchParams.get("text") || "")
  const [uiChatId, setUiChatId] = useState(searchParams.get("chat_id") || "")
  const [uiArticle, setUiArticle] = useState(searchParams.get("wb_article") || "")
  const [uiPhone, setUiPhone] = useState(searchParams.get("phone") || "")
  const [uiExtendedFilter, setUiExtendedFilter] = useState<string>(searchParams.get("extended") || "all")
  const [uiComplaintStatus, setUiComplaintStatus] = useState<string>(
    searchParams.get("complaint_feedback_status") || "all",
  )
  const [uiExcludeFromRating, setUiExcludeFromRating] = useState<string>(
    searchParams.get("exclude_from_rating") || "all",
  ) // ИЗМЕНЕНО: переименовали с uiIsHidden

  const [uiDateRange, setUiDateRange] = useState<DateRange | undefined>(() => {
    const fromDate = searchParams.get("created_from")
    const toDate = searchParams.get("created_to")
    if (fromDate || toDate) {
      return {
        from: fromDate ? new Date(fromDate) : undefined,
        to: toDate ? new Date(toDate) : undefined,
      }
    }
    return undefined
  })

  const [showFilters, setShowFilters] = useState(false)

  // New ref to track if initial filters have been applied
  const initialFiltersAppliedRef = useRef(false)

  // Function to render stars for the checkbox items
  const renderStars = (count: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  )

  // Helper function for correct Russian pluralization of "звезда"
  const getStarPlural = (count: number) => {
    if (count === 1) return "звезда"
    if (count >= 2 && count <= 4) return "звезды"
    return "звёзд"
  }

  // Effect to apply filters when "Применить фильтры" button is clicked or on initial load
  const handleApplyFilters = useCallback(() => {
    const newFilters: FeedbacksFilters = {
      limit: pageSize,
      offset: 0,
      ...(uiSearchTerm && { product_name: uiSearchTerm }),
      ...(uiSelectedStore !== "all" && { store_name: uiSelectedStore }),
      ...(uiSelectedRating.length > 0 && { valuation: uiSelectedRating.map(Number) }),
      ...(uiSelectedStatus !== "all" && { status: uiSelectedStatus }),
      ...(uiSelectedTrustFactor !== "all" && { trust_factor: uiSelectedTrustFactor }),
      ...(uiCustomerName && { user_name: uiCustomerName }),
      ...(uiReviewText && { text: uiReviewText }),
      ...(uiChatId && { chat_id: uiChatId }),
      ...(uiArticle && { wb_article: uiArticle }),
      ...(uiPhone && { phone: uiPhone }),
      ...(uiExtendedFilter !== "all" && { extended: uiExtendedFilter === "true" }),
      ...(uiComplaintStatus !== "all" && { complaint_feedback_status: uiComplaintStatus }),
      ...(uiExcludeFromRating !== "all" && { exclude_from_rating: uiExcludeFromRating === "true" }), // ИЗМЕНЕНО: заменили is_hidden на exclude_from_rating
      ...(uiDateRange?.from && { created_from: format(uiDateRange.from, "yyyy-MM-dd") }),
      ...(uiDateRange?.to && { created_to: format(uiDateRange.to, "yyyy-MM-dd") }),
      ...(filters?.order_by && { order_by: filters.order_by }),
      ...(filters?.order_dir && { order_dir: filters.order_dir }),
    }
    setFilters(newFilters)
  }, [
    pageSize,
    uiSearchTerm,
    uiSelectedStore,
    uiSelectedRating,
    uiSelectedStatus,
    uiSelectedTrustFactor,
    uiCustomerName,
    uiReviewText,
    uiChatId,
    uiArticle,
    uiPhone,
    uiExtendedFilter,
    uiComplaintStatus,
    uiExcludeFromRating, // ИЗМЕНЕНО: заменили uiIsHidden на uiExcludeFromRating
    uiDateRange,
    filters?.order_by,
    filters?.order_dir,
    setFilters,
  ])

  // EFFECT for initial load on ReviewsPage mount
  useEffect(() => {
    // Only apply initial filters once when component mounts
    if (!initialFiltersAppliedRef.current) {
      const newFilters: FeedbacksFilters = {
        limit: pageSize, // Always set limit
        offset: 0, // Always set offset initially
      }

      const productName = searchParams.get("product_name")
      if (productName) newFilters.product_name = productName

      const storeName = searchParams.get("store_name")
      if (storeName && storeName !== "all") newFilters.store_name = storeName

      const valuation = searchParams.get("valuation")
      if (valuation) newFilters.valuation = valuation.split(",").filter(Boolean).map(Number)

      const status = searchParams.get("status")
      if (status && status !== "all") newFilters.status = status

      const trustFactor = searchParams.get("trust_factor")
      if (trustFactor && trustFactor !== "all") newFilters.trust_factor = trustFactor

      const userName = searchParams.get("user_name")
      if (userName) newFilters.user_name = userName

      const text = searchParams.get("text")
      if (text) newFilters.text = text

      const chatId = searchParams.get("chat_id")
      if (chatId) newFilters.chat_id = chatId

      const wbArticle = searchParams.get("wb_article")
      if (wbArticle) newFilters.wb_article = wbArticle

      const phone = searchParams.get("phone")
      if (phone) newFilters.phone = phone

      const extended = searchParams.get("extended")
      if (extended === "true") newFilters.extended = true
      if (extended === "false") newFilters.extended = false

      const complaintStatus = searchParams.get("complaint_feedback_status")
      if (complaintStatus && complaintStatus !== "all") newFilters.complaint_feedback_status = complaintStatus

      const excludeFromRating = searchParams.get("exclude_from_rating") // ИЗМЕНЕНО: заменили is_hidden на exclude_from_rating
      if (excludeFromRating === "true") newFilters.exclude_from_rating = true // ИЗМЕНЕНО
      if (excludeFromRating === "false") newFilters.exclude_from_rating = false // ИЗМЕНЕНО

      const createdFrom = searchParams.get("created_from")
      if (createdFrom) newFilters.created_from = createdFrom

      const createdTo = searchParams.get("created_to")
      if (createdTo) newFilters.created_to = createdTo

      // Apply any existing order_by/order_dir from context if available,
      // though for initial load, search params usually define this.
      // If not, it will default to API's default.
      // No need to copy from `filters` here, as `filters` might be null.

      setFilters(newFilters) // This is the call that should trigger the context fetch
      initialFiltersAppliedRef.current = true
    }
  }, [searchParams, pageSize, setFilters])

  // Effect to synchronize UI filter states with applied filters from context
  // This is important if filters can be set from other parts of the app or on initial load from URL params
  useEffect(() => {
    if (!filters) return // Do not update UI if filters are not yet set in context
    setUiSearchTerm(filters.product_name || "")
    setUiSelectedStore(filters.store_name || "all")
    if (typeof filters.valuation === "string") {
      setUiSelectedRating(filters.valuation.split(",").filter(Boolean))
    } else if (Array.isArray(filters.valuation)) {
      setUiSelectedRating(filters.valuation.map(String))
    } else {
      setUiSelectedRating([])
    }
    setUiSelectedStatus(filters.status || "all")
    setUiSelectedTrustFactor(filters.trust_factor || "all")
    setUiCustomerName(filters.user_name || "")
    setUiReviewText(filters.text || "")
    setUiChatId(filters.chat_id || "")
    setUiArticle(filters.wb_article || "")
    setUiPhone(filters.phone || "")
    setUiExtendedFilter(filters.extended === true ? "true" : filters.extended === false ? "false" : "all")
    setUiComplaintStatus(filters.complaint_feedback_status || "all")
    setUiExcludeFromRating(
      filters.exclude_from_rating === true ? "true" : filters.exclude_from_rating === false ? "false" : "all",
    ) // ИЗМЕНЕНО: заменили is_hidden на exclude_from_rating

    setUiDateRange({
      from: filters.created_from ? new Date(filters.created_from) : undefined,
      to: filters.created_to ? new Date(filters.created_to) : undefined,
    })
  }, [filters])

  // Memoize callback functions to prevent unnecessary re-renders of child components
  const handleStatusChange = useCallback(
    async (feedbackId: string, newStatus: string) => {
      try {
        await updateFeedbackStatus(feedbackId, newStatus)
        toast({
          title: "Статус обновлен",
          description: `Статус отзыва изменен на "${newStatus}"`,
        })
      } catch (error) {
        console.error("Ошибка при обновлении статуса:", error)
        toast({
          title: "Ошибка",
          description: error instanceof Error ? error.message : "Не удалось обновить статус",
          variant: "destructive",
        })
      }
    },
    [updateFeedbackStatus],
  )

  // Sorting is still immediate as it's a table interaction
  const handleSort = useCallback(
    (field: string) => {
      const currentField = filters?.order_by
      const currentDirection = filters?.order_dir || "asc"

      let newDirection: "asc" | "desc" = "asc"
      if (currentField === field) {
        newDirection = currentDirection === "asc" ? "desc" : "asc"
      }

      setFilters({
        ...(filters || {}), // Ensure filters object exists
        order_by: field,
        order_dir: newDirection,
        offset: 0,
      })
    },
    [filters, setFilters],
  )

  // Reset all UI filters and apply empty filters to context
  const resetFilters = useCallback(() => {
    setUiSearchTerm("")
    setUiSelectedStore("all")
    setUiSelectedRating([])
    setUiSelectedStatus("all")
    setUiSelectedTrustFactor("all")
    setUiCustomerName("")
    setUiReviewText("")
    setUiChatId("")
    setUiArticle("")
    setUiPhone("")
    setUiExtendedFilter("all")
    setUiComplaintStatus("all")
    setUiExcludeFromRating("all") // ИЗМЕНЕНО: заменили uiIsHidden на uiExcludeFromRating
    setUiDateRange(undefined)
    setFilters({ limit: pageSize, offset: 0 })
  }, [pageSize, setFilters])

  // Get unique store names from accounts for filter options
  const storeOptions = useMemo(() => {
    const uniqueStores = new Set<string>()
    accounts.forEach((account) => {
      if (account.store_name) {
        uniqueStores.add(account.store_name)
      }
    })
    return Array.from(uniqueStores)
  }, [accounts])

  // Calculate current page and total pages based on applied filters
  const currentPage = Math.floor((filters?.offset || 0) / pageSize) + 1
  const totalPages = Math.ceil(total / pageSize)

  // Handle page change (pagination is immediate)
  const handlePageChange = useCallback(
    (page: number) => {
      const newOffset = (page - 1) * pageSize
      setFilters({
        ...(filters || {}),
        offset: newOffset,
      })
    },
    [pageSize, filters, setFilters],
  )

  // Handle page size change (calls context's setPageSize)
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size)
    },
    [setPageSize],
  )

  // Memoize currentSort object to prevent unnecessary re-renders of ReviewsTableContent
  const currentSort = useMemo(() => {
    return {
      field: filters?.order_by,
      direction: filters?.order_dir,
    }
  }, [filters?.order_by, filters?.order_dir])

  const hasActiveUiFilters =
    uiSearchTerm ||
    uiSelectedStore !== "all" ||
    uiSelectedRating.length > 0 ||
    uiSelectedStatus !== "all" ||
    uiSelectedTrustFactor !== "all" ||
    uiCustomerName ||
    uiReviewText ||
    uiChatId ||
    uiArticle ||
    uiPhone ||
    uiExtendedFilter !== "all" ||
    uiComplaintStatus !== "all" ||
    uiExcludeFromRating !== "all" || // ИЗМЕНЕНО: заменили uiIsHidden на uiExcludeFromRating
    uiDateRange?.from ||
    uiDateRange?.to

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Отзывы</h1>
        <Button variant="outline" onClick={refreshFeedbacks} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {/* Filter Panel */}
      <Card>
        <CardContent className="pt-6">
          <Collapsible open={showFilters} onOpenChange={setShowFilters} className="w-full space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Фильтры</h2>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? "Скрыть" : "Показать"}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 duration-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Product Name Search */}
                <div className="space-y-2">
                  <label htmlFor="product-search" className="text-sm font-medium">
                    Поиск по товару
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="product-search"
                      placeholder="Название товара..."
                      value={uiSearchTerm}
                      onChange={(e) => setUiSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Article Search */}
                <div className="space-y-2">
                  <label htmlFor="article-search" className="text-sm font-medium">
                    Артикул
                  </label>
                  <Input
                    id="article-search"
                    placeholder="Артикул товара..."
                    value={uiArticle}
                    onChange={(e) => setUiArticle(e.target.value)}
                  />
                </div>

                {/* Customer Name Search */}
                <div className="space-y-2">
                  <label htmlFor="customer-name" className="text-sm font-medium">
                    Покупатель
                  </label>
                  <Input
                    id="customer-name"
                    placeholder="Имя покупателя..."
                    value={uiCustomerName}
                    onChange={(e) => setUiCustomerName(e.target.value)}
                  />
                </div>

                {/* Review Text Search */}
                <div className="space-y-2">
                  <label htmlFor="review-text" className="text-sm font-medium">
                    Текст отзыва
                  </label>
                  <Input
                    id="review-text"
                    placeholder="Поиск в тексте отзыва..."
                    value={uiReviewText}
                    onChange={(e) => setUiReviewText(e.target.value)}
                  />
                </div>

                {/* Chat ID Search */}
                <div className="space-y-2">
                  <label htmlFor="chat-id" className="text-sm font-medium">
                    ID чата
                  </label>
                  <Input
                    id="chat-id"
                    placeholder="ID чата..."
                    value={uiChatId}
                    onChange={(e) => setUiChatId(e.target.value)}
                  />
                </div>

                {/* Store Filter */}
                <div className="space-y-2">
                  <label htmlFor="store-select" className="text-sm font-medium">
                    Магазин
                  </label>
                  <Select value={uiSelectedStore} onValueChange={setUiSelectedStore}>
                    <SelectTrigger id="store-select">
                      <SelectValue placeholder="Выберите магазин" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все магазины</SelectItem>
                      {storeOptions.map((store) => (
                        <SelectItem key={store} value={store}>
                          {store}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter - Изменено на Popover с чекбоксами */}
                <div className="space-y-2">
                  <label htmlFor="rating-select" className="text-sm font-medium">
                    Рейтинг
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between bg-transparent">
                        {uiSelectedRating.length > 0
                          ? uiSelectedRating
                              .sort((a, b) => Number(b) - Number(a))
                              .map((r) => `${r} ${getStarPlural(Number.parseInt(r))}`)
                              .join(", ")
                          : "Любой рейтинг"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto min-w-[240px] p-0" align="start">
                      <div className="flex flex-col p-2">
                        {["5", "4", "3", "2", "1"].map((rating) => (
                          <label
                            key={rating}
                            htmlFor={`rating-${rating}`}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          >
                            <Checkbox
                              id={`rating-${rating}`}
                              checked={uiSelectedRating.includes(rating)}
                              onCheckedChange={(checked) => {
                                setUiSelectedRating((prev) => {
                                  if (checked) {
                                    return [...prev, rating]
                                  } else {
                                    return prev.filter((r) => r !== rating)
                                  }
                                })
                              }}
                            />
                            {renderStars(Number.parseInt(rating))}
                            <span className="text-sm whitespace-nowrap">
                              {rating} {getStarPlural(Number.parseInt(rating))}
                            </span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label htmlFor="status-select" className="text-sm font-medium">
                    Статус
                  </label>
                  <Select value={uiSelectedStatus} onValueChange={setUiSelectedStatus}>
                    <SelectTrigger id="status-select">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Любой статус</SelectItem>
                      <SelectItem value="Новый">Новый</SelectItem>
                      <SelectItem value="Ожидание">Ожидание</SelectItem>
                      <SelectItem value="Отказ">Отказ</SelectItem>
                      <SelectItem value="Удалён">Удалён</SelectItem>
                      <SelectItem value="Вернули оплату">Вернули оплату</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trust Factor Filter (Buyout) */}
                <div className="space-y-2">
                  <label htmlFor="trust-factor-select" className="text-sm font-medium">
                    Выкуп
                  </label>
                  <Select value={uiSelectedTrustFactor} onValueChange={setUiSelectedTrustFactor}>
                    <SelectTrigger id="trust-factor-select">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Любой</SelectItem>
                      <SelectItem value="buyout">Выкуп</SelectItem>
                      <SelectItem value="rejected">Отказ</SelectItem>
                      <SelectItem value="returned">Возврат</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* НОВОЕ: Отзыв дополнен */}
                <div className="space-y-2">
                  <label htmlFor="extended-filter" className="text-sm font-medium">
                    Отзыв дополнен
                  </label>
                  <Select value={uiExtendedFilter} onValueChange={setUiExtendedFilter}>
                    <SelectTrigger id="extended-filter">
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="true">Да</SelectItem>
                      <SelectItem value="false">Нет</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* НОВОЕ: Статус жалобы */}
                <div className="space-y-2">
                  <label htmlFor="complaint-status-filter" className="text-sm font-medium">
                    Статус жалобы
                  </label>
                  <Select value={uiComplaintStatus} onValueChange={setUiComplaintStatus}>
                    <SelectTrigger id="complaint-status-filter">
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="approved">Одобрена</SelectItem>
                      <SelectItem value="reassessed">Пересмотрена</SelectItem>
                      <SelectItem value="rejected">Отклонена</SelectItem>
                      <SelectItem value="review">На рассмотрении</SelectItem>
                      <SelectItem value="unknown">Без жалобы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ИЗМЕНЕНО: Исключён из рейтинга - теперь работает с exclude_from_rating */}
                <div className="space-y-2">
                  <label htmlFor="exclude-from-rating-filter" className="text-sm font-medium">
                    Исключён из рейтинга
                  </label>
                  <Select value={uiExcludeFromRating} onValueChange={setUiExcludeFromRating}>
                    <SelectTrigger id="exclude-from-rating-filter">
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="true">Да</SelectItem>
                      <SelectItem value="false">Нет</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* НОВОЕ: Телефонный фильтр, виден только пользователям с правами просмотра данных покупателя */}
                {user?.features?.can_view_buyer_data && (
                  <div className="space-y-2">
                    <label htmlFor="phone-search" className="text-sm font-medium">
                      Телефон
                    </label>
                    <Input
                      id="phone-search"
                      placeholder="Номер телефона..."
                      value={uiPhone}
                      onChange={(e) => setUiPhone(e.target.value)}
                    />
                  </div>
                )}

                {/* Date Range Filter - Заменяем два отдельных поля на одно с диапазоном */}
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <label htmlFor="date-range" className="text-sm font-medium">
                    Период
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-range"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !uiDateRange && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {uiDateRange?.from ? (
                          uiDateRange.to ? (
                            <>
                              {format(uiDateRange.from, "dd.MM.yyyy", { locale: ru })} -{" "}
                              {format(uiDateRange.to, "dd.MM.yyyy", { locale: ru })}
                            </>
                          ) : (
                            format(uiDateRange.from, "dd.MM.yyyy", { locale: ru })
                          )
                        ) : (
                          "Выберите период"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={uiDateRange?.from}
                        selected={uiDateRange}
                        onSelect={setUiDateRange}
                        numberOfMonths={2}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleApplyFilters} disabled={isLoading}>
                  Применить фильтры
                </Button>
                {hasActiveUiFilters && (
                  <Button variant="outline" onClick={resetFilters}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <ReviewsTableContent
        feedbacks={feedbacks}
        isLoading={isLoading}
        error={error}
        total={total}
        pageSize={pageSize}
        currentPage={currentPage}
        totalPages={totalPages}
        currentSort={currentSort}
        onStatusChange={handleStatusChange}
        onPageChange={handlePageChange}
        onSort={handleSort}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
