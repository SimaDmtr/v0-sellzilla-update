// API базовый URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sellzilla.club"

// Cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Helper function to get cached data
function getCachedData<T>(key: string): T | null {
  const cached = apiCache.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  apiCache.delete(key)
  return null
}

// Helper function to set cached data
function setCachedData<T>(key: string, data: T, ttl = 30000): void {
  apiCache.set(key, { data, timestamp: Date.now(), ttl })
}

// Типы для API ответов
export interface AuthResponse {
  access_token: string
}

export interface MessageResponse {
  message: string
}

// Обновленный тип пользователя с новыми полями features
export interface UserResponse {
  id: number
  email: string
  name?: string
  is_admin?: boolean
  features: {
    can_complain: boolean
    can_autoanswer: boolean
    can_autodialog: boolean
    can_view_buyer_data: boolean
  }
}

// Обновленные типы для ошибок
export interface ErrorResponse {
  detail:
    | string
    | {
        message: string
        errors: string[]
      }
}

// Типы для аккаунтов WB
export interface WBAccountRequest {
  name: string
  authorizev3: string
  wbx_validation_key: string
  api_key: string
}

// Обновляем типы для API ответов
export interface WBAccountResponse {
  id: string
  name: string
  inn: string | null
  store_name: string | null
  supplier_id: string | null
  unp: string | null
  sid: string | null
  cookie_status: boolean | null
  api_status: boolean | null
  match_status: boolean | null
  autoanswer_status: boolean
  autodialog_status: boolean
  response_status: number
  message_status: number
  authorizev3?: string
  wbx_validation_key?: string
  api_key?: string
  settings: {
    auto_responses?: {
      marks?: {
        [rating: string]: {
          enabled: boolean
          response_type: "auto" | "fixed"
          fixed_text: string
        }
      }
      include_signature?: boolean
      signature?: string
    }
    auto_messages?: {
      [rating: string]: {
        enabled: boolean
        message_text: string
      }
    }
    proxy?: {
      enabled: boolean
      protocol: "HTTP" | "HTTPS" | "SOCKS5"
      host: string
      port: number
      username: string
      password: string
    }
  }
  message?: string
  proxy_enabled: boolean
  proxy_protocol: "HTTP" | "HTTPS" | "SOCKS5" | null
  proxy_host: string | null
  proxy_port: number | null
  proxy_username: string | null
  proxy_password: string | null
}

// Обновляем типы для обновления аккаунта
export interface WBAccountUpdateRequest {
  name?: string
  authorizev3?: string
  wbx_validation_key?: string
  api_key?: string
  settings?: {
    auto_responses?: {
      marks?: {
        [rating: string]: {
          enabled: boolean
          response_type: "auto" | "fixed"
          fixed_text: string
        }
      }
      include_signature?: boolean
      signature?: string
    }
    auto_messages?: {
      [rating: string]: {
        enabled: boolean
        message_text: string
      }
    }
  }
  proxy_enabled?: boolean
  proxy_protocol?: "HTTP" | "HTTPS" | "SOCKS5" | null
  proxy_host?: string | null
  proxy_port?: number | null
  proxy_username?: string | null
  proxy_password?: string | null
}

// Новый интерфейс для первоначального отзыва
export interface ParentFeedback {
  created_at: string
  valuation: number
  text: string
  feedback_text_pros: string
  feedback_text_cons: string
  bad_reasons: string[]
  good_reasons: string[]
}

// Типы для жалоб
export interface ComplaintReason {
  id: number
  label: string
}

export interface ComplaintResponse {
  reasons: ComplaintReason[]
  ai_reason_id: number
  feedback_id: string
  compliant_text: string
}

export interface SendComplaintRequest {
  sid: string
  feedbackId: string
  feedbackComplaint: {
    id: number
    explanation: string
  }
}

export interface SendComplaintResponse {
  success: boolean
  message: string
}

// Обновленный интерфейс для makeComplaint - теперь принимает полные данные отзыва включая sid
export interface MakeComplaintRequest {
  id: string
  sid: string
  created_at: string
  sale_dt: string
  rid: string
  valuation: number
  text: string
  wb_article: number
  product_name: string
  brand: string
  exclude_from_rating: string
  trust_factor: string
  user_name: string
  buyer_id: number
  register_date: string
  status: string
  is_hidden: boolean
  feedback_text_pros: string
  feedback_text_cons: string
  bad_reasons: string[]
  good_reasons: string[]
  price: number | null
  store_name: string
  pvz: string | null
  pvz_id: number | null
  positive_count: number | null
  negative_count: number | null
  chat_id: string | null
  total_feedbacks: number | null
  parent_feedback: ParentFeedback | null
  phone: number | null
  has_photos: boolean
  has_video: boolean
}

// Типы для отзывов API (обновлено с добавлением sid)
export interface FeedbackItem {
  id: string
  sid: string
  created_at: string
  rid: string
  valuation: number
  text: string
  wb_article: number
  product_name: string
  brand: string
  trust_factor: string
  user_name: string
  status: string
  feedback_text_pros: string
  feedback_text_cons: string
  good_reasons: string[]
  bad_reasons: string[]
  price: number | null
  store_name: string
  chat_id: string | null
  pvz: string | null
  register_date: string | null
  positive_count: number | null
  negative_count: number | null
  buyer_id: number | null
  total_feedbacks: number | null
  parent_feedback: ParentFeedback | null
  phone: number | null
  exclude_from_rating: string | null
  is_hidden: boolean | null
  extended: boolean | null
  complaint_feedback_explanation: string | null
  complaint_feedback_status: string | null
  complaint_feedback_text: string | null
}

export interface PaginatedResponse<T> {
  total: number
  page_size: number
  has_next: boolean
  results: T[]
}

export interface FeedbacksResponse {
  total: number
  page_size: number
  has_next: boolean
  results: FeedbackItem[]
}

export interface FeedbacksFilters {
  limit?: number
  offset?: number
  status?: string
  product_name?: string
  valuation?: number[]
  wb_article?: string
  created_from?: string
  created_to?: string
  store_name?: string
  chat_id?: string
  user_name?: string
  trust_factor?: string
  text?: string
  order_by?: string
  order_dir?: "asc" | "desc"
  phone?: string
  extended?: boolean
  complaint_feedback_status?: string
  exclude_from_rating?: boolean
}

// НОВЫЕ ТИПЫ ДЛЯ СТАТИСТИКИ ОТЗЫВОВ
export interface FeedbackStatItem {
  day: string
  count: number
}

export interface FeedbackStatsResponse {
  new_feedbacks: FeedbackStatItem[]
  deleted_feedbacks: FeedbackStatItem[]
  total_feedbacks: number
  total_deleted_feedbacks: number
}

// Типы для отзывов пользователя
export interface UserFeedbackItem {
  feedback_id: string
  user_name: string | null
  user_country: string
  text: string | null
  pros: string | null
  cons: string | null
  product_valuation: number
  created_date: string
  updated_date: string
  nm_id: number
  imt_id: number
  color: string | null
  size: string | null
  photo: string | null
  video_id: string | null
  status_id: number
  votes_pluses: number
  votes_minuses: number
  is_excluded: boolean | null
  product_name: string | null
  product_brand: string | null
  supplier_id: number | null
  supplier_name: string | null
}

export interface UserFeedbacksResponse {
  total: number
  page_size: number
  has_next: boolean
  results: UserFeedbackItem[]
}

export interface UserFeedbacksFilters {
  limit?: number
  offset?: number
}

// Типы для обновления статуса отзыва
export interface UpdateFeedbackStatusRequest {
  id: string
  status: string
}

// Типы для платежей
export interface CreatePaymentRequest {
  amount_rub: number
  description: string
}

export interface CreatePaymentResponse {
  yk_payment_id: string
  confirmation_url: string
  status: string
}

// Новый тип для статуса платежа
export interface PaymentStatusResponse {
  yk_payment_id: string
  status: "pending" | "succeeded" | "failed" | "canceled"
  amount_rub: number
  description: string
  created_at: string
  updated_at: string
}

// Обновленный тип для баланса пользователя
export interface UserBalanceResponse {
  balance_minor: number
  balance_rub: number
  tariff_per_day: number
}

// Класс для работы с API
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
  }

  // Методы для работы с токеном
  public setToken(token: string): void {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  }

  public removeToken(): void {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
    }
  }

  public hasToken(): boolean {
    return !!this.token
  }

  public getToken(): string | null {
    return this.token
  }

  // Базовый метод для выполнения запросов с кешированием
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL?: number,
  ): Promise<T> {
    // Check cache for GET requests
    if (cacheKey && (!options.method || options.method === "GET")) {
      const cached = getCachedData<T>(cacheKey)
      if (cached) {
        return cached
      }
    }

    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Добавляем токен авторизации если он есть
    if (this.token && !config.headers?.["Authorization"]) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        try {
          const errorData: ErrorResponse = await response.json()

          // Обрабатываем новую структуру ошибок
          if (typeof errorData.detail === "object" && errorData.detail.message) {
            // Если есть дополнительные ошибки, добавляем их к основному сообщению
            let errorMessage = errorData.detail.message
            if (errorData.detail.errors && errorData.detail.errors.length > 0) {
              errorMessage += "\n\nДетали:\n" + errorData.detail.errors.join("\n")
            }
            throw new Error(errorMessage)
          } else if (typeof errorData.detail === "string") {
            // Старый формат ошибок
            throw new Error(errorData.detail)
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message !== `HTTP ${response.status}: ${response.statusText}`) {
            throw parseError
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      }

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        return {} as T
      }

      const data = await response.json()

      // Cache successful GET responses
      if (cacheKey && (!options.method || options.method === "GET") && cacheTTL) {
        setCachedData(cacheKey, data, cacheTTL)
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Ошибка сети. Попробуйте позже.")
    }
  }

  // Методы авторизации
  async register(email: string, password: string): Promise<MessageResponse> {
    return this.request<MessageResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async verifyRegistration(email: string, code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/verify-registration", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })
    if (response.access_token) {
      this.setToken(response.access_token)
    }
    return response
  }

  async login(email: string, password: string): Promise<MessageResponse> {
    return this.request<MessageResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async verifyLogin(email: string, code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/verify-login", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })
    if (response.access_token) {
      this.setToken(response.access_token)
    }
    return response
  }

  // Методы для работы с пользователем
  async getCurrentUser(): Promise<UserResponse> {
    if (!this.hasToken()) {
      throw new Error("No authentication token found.")
    }
    return this.request<UserResponse>("/auth/me")
  }

  async logout(): Promise<void> {
    this.removeToken()
    console.log("Client-side logout: Token removed.")
    return Promise.resolve()
  }

  // Методы восстановления пароля
  async requestPasswordReset(email: string): Promise<MessageResponse> {
    return this.request<MessageResponse>("/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(email: string, code: string, password: string): Promise<MessageResponse> {
    return this.request<MessageResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    })
  }

  // Методы смены пароля
  async changePassword(currentPassword: string, newPassword: string): Promise<MessageResponse> {
    return this.request<MessageResponse>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
  }

  // Методы для работы с аккаунтами WB
  async addWBAccount(accountData: WBAccountRequest): Promise<WBAccountResponse> {
    return this.request<WBAccountResponse>("/accounts/", {
      method: "POST",
      body: JSON.stringify(accountData),
    })
  }

  async updateWBAccount(accountId: string, data: WBAccountUpdateRequest): Promise<WBAccountResponse> {
    return this.request<WBAccountResponse>(`/accounts/${accountId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteWBAccount(accountId: string): Promise<void> {
    return this.request<void>(`/accounts/${accountId}`, {
      method: "DELETE",
    })
  }

  // Методы для работы с аккаунтами WB с кешированием
  async getWBAccounts(): Promise<WBAccountResponse[]> {
    return this.request<WBAccountResponse[]>("/accounts/", {}, "wb-accounts", 30000)
  }

  async getWBAccount(accountId: string): Promise<WBAccountResponse> {
    return this.request<WBAccountResponse>(`/accounts/${accountId}`, {}, `wb-account-${accountId}`, 30000)
  }

  // Методы для работы с отзывами с кешированием
  async getFeedbacks(filters: FeedbacksFilters = {}): Promise<FeedbacksResponse> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (key === "valuation" && Array.isArray(value)) {
          value.forEach((val) => params.append(key, val.toString()))
        } else if ((key === "extended" || key === "exclude_from_rating") && typeof value === "boolean") {
          params.append(key, value.toString())
        } else {
          params.append(key, value.toString())
        }
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/feedbacks?${queryString}` : "/feedbacks"
    const cacheKey = `feedbacks-${queryString}`

    return this.request<FeedbacksResponse>(endpoint, {}, cacheKey, 15000)
  }

  // Получение статистики отзывов с кешированием
  async getFeedbackStats(date_from: string, date_to: string): Promise<FeedbackStatsResponse> {
    const params = new URLSearchParams({
      date_from,
      date_to,
    })
    const queryString = params.toString()
    const endpoint = `/feedbacks/stats?${queryString}`
    const cacheKey = `feedback-stats-${queryString}`

    return this.request<FeedbackStatsResponse>(endpoint, {}, cacheKey, 30000)
  }

  // Получение баланса пользователя с кешированием
  async getUserBalance(): Promise<UserBalanceResponse> {
    return this.request<UserBalanceResponse>("/billing/balance", {}, "user-balance", 10000)
  }

  // Метод для получения отзывов пользователя
  async getUserFeedbacks(buyerId: number, filters: UserFeedbacksFilters = {}): Promise<UserFeedbacksResponse> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/feedbacks/user/${buyerId}/?${queryString}` : `/feedbacks/user/${buyerId}/`

    return this.request<UserFeedbacksResponse>(endpoint)
  }

  // Метод для обновления статуса отзыва
  async updateFeedbackStatus(data: UpdateFeedbackStatusRequest): Promise<MessageResponse> {
    return this.request<MessageResponse>("/feedbacks/update-status", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // ОБНОВЛЕННЫЕ МЕТОДЫ: Работа с жалобами (теперь с sid)
  async makeComplaint(feedback: FeedbackItem): Promise<ComplaintResponse> {
    try {
      // Формируем объект запроса из данных отзыва включая sid
      const complaintRequest: MakeComplaintRequest = {
        id: feedback.id,
        sid: feedback.sid,
        created_at: feedback.created_at,
        sale_dt: feedback.created_at,
        rid: feedback.rid,
        valuation: feedback.valuation,
        text: feedback.text,
        wb_article: feedback.wb_article,
        product_name: feedback.product_name,
        brand: feedback.brand,
        exclude_from_rating: feedback.exclude_from_rating || "",
        trust_factor: feedback.trust_factor,
        user_name: feedback.user_name,
        buyer_id: feedback.buyer_id || 0,
        register_date: feedback.register_date || "",
        status: feedback.status,
        is_hidden: feedback.is_hidden || false,
        feedback_text_pros: feedback.feedback_text_pros,
        feedback_text_cons: feedback.feedback_text_cons,
        bad_reasons: feedback.bad_reasons,
        good_reasons: feedback.good_reasons,
        price: feedback.price,
        store_name: feedback.store_name,
        pvz: feedback.pvz,
        pvz_id: null,
        positive_count: feedback.positive_count,
        negative_count: feedback.negative_count,
        chat_id: feedback.chat_id,
        total_feedbacks: feedback.total_feedbacks,
        parent_feedback: feedback.parent_feedback,
        phone: feedback.phone,
        has_photos: false,
        has_video: false,
      }

      return this.request<ComplaintResponse>("/feedbacks/makeComplaint", {
        method: "POST",
        body: JSON.stringify(complaintRequest),
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return {
          reasons: [],
          ai_reason_id: 0,
          feedback_id: "",
          compliant_text: "Опишите, что не так с этим отзывом. Укажите причину жалобы и детали нарушения.",
        }
      }
      throw error
    }
  }

  async sendComplaint(
    feedbackId: string,
    sid: string,
    reasonId: number,
    complaintText: string,
  ): Promise<SendComplaintResponse> {
    try {
      const response = await this.request<SendComplaintResponse>("/feedbacks/sendComplaint", {
        method: "POST",
        body: JSON.stringify({
          sid: sid,
          feedbackId: feedbackId,
          feedbackComplaint: {
            id: reasonId,
            explanation: complaintText,
          },
        }),
      })

      // Если success: false, это ошибка от API
      if (response.success === false) {
        throw new Error(response.message || "Не удалось отправить жалобу")
      }

      return response
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        throw new Error("Функция подачи жалоб временно недоступна. Попробуйте позже.")
      }
      throw error
    }
  }

  // Метод для проверки прокси подключения (теперь с sid)
  async testProxyConnection(proxySettings: {
    protocol: "HTTP" | "HTTPS" | "SOCKS5"
    host: string
    port: number
    username?: string
    password?: string
    sid?: string
  }): Promise<{ success: boolean; message: string; data?: any }> {
    return this.request<{ success: boolean; message: string; data?: any }>("/accounts/test-proxy", {
      method: "POST",
      body: JSON.stringify(proxySettings),
    })
  }

  // Методы для работы с платежами
  async createPayment(amount: number): Promise<CreatePaymentResponse> {
    return this.request<CreatePaymentResponse>("/billing/create-payment", {
      method: "POST",
      body: JSON.stringify({
        amount_rub: amount,
        description: "Пополнение баланса",
      }),
    })
  }

  // НОВЫЙ МЕТОД: Проверка статуса платежа
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    return this.request<PaymentStatusResponse>(`/billing/payment-status?payment_id=${paymentId}`)
  }
}

// Экспортируем экземпляр API клиента
export const apiClient = new ApiClient(API_BASE_URL)
