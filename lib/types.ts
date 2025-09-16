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
  inn: string
  store_name: string
  supplier_id: string
  cookie_status: boolean
  api_status: boolean
  match_status: boolean
  autoanswer_status: boolean
  autodialog_status: boolean
  response_status: number
  message_status: number
  authorizev3?: string
  wbx_validation_key?: string
  api_key?: string
  settings: {
    auto_responses: {
      marks: {
        [rating: string]: {
          enabled: boolean
          response_type: "auto" | "fixed"
          fixed_text: string
        }
      }
      include_signature: boolean
      signature: string
    }
    auto_messages: {
      [rating: string]: {
        enabled: boolean
        message_text: string
      }
    }
    proxy: {
      enabled: boolean
      protocol: "HTTP" | "HTTPS" | "SOCKS5"
      host: string
      port: number
      username: string
      password: string
    }
  }
  message?: string
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
    proxy?: {
      enabled: boolean
      protocol: "HTTP" | "HTTPS" | "SOCKS5"
      host: string
      port: number
      username: string
      password: string
    }
  }
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

// Типы для отзывов API (обновлено с добавлением sid)
export interface FeedbackItem {
  id: string
  sid: string // ДОБАВЛЕНО: новое поле sid
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
