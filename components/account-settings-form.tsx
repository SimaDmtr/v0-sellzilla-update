"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  Key,
  Cookie,
  X,
  CheckCircle,
  AlertTriangle,
  Star,
  Bot,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  Globe,
  Shield,
  CreditCard,
} from "lucide-react"
import { apiClient, type WBAccountResponse } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useAccounts } from "@/lib/context/accounts-context"
import { useAuth } from "@/lib/context/auth-context"
import Link from "next/link"

interface AccountSettingsFormProps {
  accountId: string
  onComplete?: () => void
}

interface RatingSettings {
  responseEnabled: boolean
  responseType: "auto" | "fixed"
  fixedText: string
  autoMessageEnabled: boolean
  autoMessageText: string
}

interface AllRatingsSettings {
  [rating: string]: RatingSettings
}

interface GlobalSettings {
  includeSignature: boolean
  signature: string
}

interface ProxySettings {
  enabled: boolean
  protocol: "HTTP" | "HTTPS" | "SOCKS5"
  host: string
  port: number | null
  username: string
  password: string
}

const defaultSignature = "Наш гарантийный отдел всегда на связи в «Чате с продавцом» или в Whаtsарр: +790123456789"

const defaultAutoMessageTemplate = `{Name}, здравствуйте. Получили в отзыве ваше сообщение о проблеме с товаром «{Product}», который вы получили {Date2}, стоимость {Price}.

Подскажите, решит ли проблему частичный возврат оплаты? Если да, то какой?`

// Компонент для копирования кода
function CopyCodeButton({ code, className = "" }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Ошибка копирования:", err)
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать код",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={`gap-2 ${className}`}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Скопировано!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Копировать
        </>
      )}
    </Button>
  )
}

// Компонент инструкции
function InstructionDialog() {
  const authCode = `localStorage.getItem("wb-eu-passport-v2.access-token") ? (copy(localStorage.getItem("wb-eu-passport-v2.access-token")), console.log("✅ Токен скопирован в буфер обмена")) : console.warn("❌ Токен не найден");`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2 bg-transparent">
          <HelpCircle className="h-4 w-4" />
          Инструкция
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-600">
            📋 Инструкция по получению данных для подключения аккаунта Wildberries
          </DialogTitle>
          <DialogDescription>
            Пошаговое руководство для получения токена авторизации, ключа валидации и API ключа
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Важное предупреждение */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">⚠️ Важно!</p>
                  <p className="text-sm text-yellow-700">
                    Все действия выполняйте в браузере, где вы авторизованы в личном кабинете Wildberries.
                  </p>
                </div>
              </div>
            </div>

            {/* Получение токена авторизации */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">🔑 1. Получение Токена авторизации (authorizev3)</h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 1: Откройте браузер</h4>
                  <p className="text-sm text-gray-600">
                    Перейдите на сайт{" "}
                    <a
                      href="https://seller.wildberries.ru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      seller.wildberries.ru
                    </a>{" "}
                    и авторизуйтесь в личном кабинете
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 2: Откройте консоль разработчика</h4>
                  <p className="text-sm text-gray-600 mb-2">Нажмите F12 или используйте сочетание клавиш:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>
                      • Windows: <code className="bg-gray-200 px-2 py-1 rounded">Ctrl+Shift+I</code>
                    </li>
                    <li>
                      • Mac: <code className="bg-gray-200 px-2 py-1 rounded">Cmd+Option+I</code>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 3: Перейдите во вкладку Console</h4>
                  <p className="text-sm text-gray-600">
                    В инструментах разработчика найдите и откройте вкладку "Console" (Консоль)
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 4: Выполните код</h4>
                  <p className="text-sm text-gray-600 mb-3">Скопируйте и вставьте следующий код в консоль:</p>
                  <div className="relative">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <code>{authCode}</code>
                    </div>
                    <div className="absolute top-2 right-2">
                      <CopyCodeButton code={authCode} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Нажмите Enter для выполнения кода</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium mb-2 text-green-800">Результат:</h4>
                  <p className="text-sm text-green-700">
                    Если токен найден, он будет автоматически скопирован в буфер обмена, и вы увидите сообщение "✅
                    Токен скопирован в буфер обмена"
                  </p>
                </div>
              </div>
            </div>

            {/* Получение ключа валидации */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                🔐 2. Получение Ключа валидации (wbx_validation_key)
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 1: Откройте инструменты разработчика</h4>
                  <p className="text-sm text-gray-600">
                    В том же браузере, где открыт кабинет Wildberries, откройте инструменты разработчика (F12)
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 2: Перейдите во вкладку Application/Storage</h4>
                  <p className="text-sm text-gray-600">
                    Найдите и откройте вкладку "Application" (в Chrome) или "Storage" (в Firefox)
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 3: Найдите раздел Cookies</h4>
                  <p className="text-sm text-gray-600">В левой панели найдите раздел "Cookies" и разверните его</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 4: Выберите домен</h4>
                  <p className="text-sm text-gray-600">
                    Выберите домен <code className="bg-gray-200 px-2 py-1 rounded">https://seller.wildberries.ru</code>
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 5: Найдите и скопируйте ключ</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    В списке cookies найдите поле с именем{" "}
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">wbx_validation_key</span>
                  </p>
                  <p className="text-sm text-gray-600">Скопируйте значение этого поля (столбец "Value")</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Примечание:</strong> Если поле не отображается, попробуйте обновить страницу и повторите
                    поиск
                  </p>
                </div>
              </div>
            </div>

            {/* Получение API ключа */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">🔧 3. Получение API ключа</h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 1: Перейдите в настройки API</h4>
                  <p className="text-sm text-gray-600">
                    В личном кабинете Wildberries найдите раздел{" "}
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                      "Настройки" → "Доступ к API"
                    </span>
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 2: Создайте новый токен</h4>
                  <p className="text-sm text-gray-600 mb-2">Нажмите "Создать новый токен" и выберите права доступа:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>✅ Статистика - Чтение</li>
                    <li>✅ Отзывы - Чтение и запись</li>
                    <li>✅ Вопросы и ответы - Чтение и запись</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Шаг 3: Скопируйте ключ</h4>
                  <p className="text-sm text-gray-600">
                    После создания скопируйте API ключ и сохраните его в безопасном месте
                  </p>
                </div>
              </div>
            </div>

            {/* Предупреждения безопасности */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">🔒 Безопасность</p>
                  <ul className="text-sm text-red-700 space-y-1 mt-1">
                    <li>• Никогда не передавайте эти данные третьим лицам</li>
                    <li>• API ключ отображается только один раз при создании</li>
                    <li>• Регулярно обновляйте API ключи</li>
                    <li>• Используйте данные только в проверенных сервисах</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Возможные проблемы */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">❓ Возможные проблемы и решения</h3>

              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2 text-gray-800">Проблема: Токен не найден</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Решение:</strong> Убедитесь, что вы авторизованы в кабинете и обновите страницу
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2 text-gray-800">Проблема: Ключ валидации не найден в cookies</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Решение:</strong> Обновите страницу кабинета и повторите поиск. Если ключ по-прежнему не
                    отображается, обратитесь в поддержку
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2 text-gray-800">Проблема: API ключ не работает</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Решение:</strong> Проверьте права доступа токена в настройках кабинета
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// Нормализация данных аккаунта
function normalizeAccountData(accountData: WBAccountResponse): WBAccountResponse {
  return {
    ...accountData,
    inn: accountData.inn || "",
    store_name: accountData.store_name || "",
    supplier_id: accountData.supplier_id || "",
    sid: accountData.sid || "",
    settings: {
      auto_responses: {
        marks: accountData.settings?.auto_responses?.marks || {},
        include_signature: accountData.settings?.auto_responses?.include_signature || false,
        signature: accountData.settings?.auto_responses?.signature || "",
      },
      auto_messages: accountData.settings?.auto_messages || {},
      proxy: {
        enabled: accountData.proxy_enabled || accountData.settings?.proxy?.enabled || false,
        protocol: accountData.proxy_protocol || accountData.settings?.proxy?.protocol || "HTTP",
        host: accountData.proxy_host || accountData.settings?.proxy?.host || "",
        port: accountData.proxy_port || accountData.settings?.proxy?.port || null,
        username: accountData.proxy_username || accountData.settings?.proxy?.username || "",
        password: accountData.proxy_password || accountData.settings?.proxy?.password || "",
      },
    },
    proxy_enabled: accountData.proxy_enabled || false,
    proxy_protocol: accountData.proxy_protocol || null,
    proxy_host: accountData.proxy_host || null,
    proxy_port: accountData.proxy_port || null,
    proxy_username: accountData.proxy_username || null,
    proxy_password: accountData.proxy_password || null,
  }
}

// Изменим компонент RatingSettingsCard, чтобы убрать индивидуальные уведомления
function RatingSettingsCard({
  rating,
  settings,
  onSettingsChange,
}: {
  rating: string
  settings: RatingSettings
  onSettingsChange: (rating: string, newSettings: RatingSettings) => void
}) {
  const { user } = useAuth()

  // Получаем права доступа пользователя
  const canAutoanswer = user?.features?.can_autoanswer ?? false
  const canAutodialog = user?.features?.can_autodialog ?? false

  const updateSettings = (updates: Partial<RatingSettings>) => {
    onSettingsChange(rating, { ...settings, ...updates })
  }

  const handleInsertTemplate = (type: "response" | "message") => {
    const currentText = type === "response" ? settings.fixedText : settings.autoMessageText
    const template = type === "response" ? "" : defaultAutoMessageTemplate

    if (currentText && currentText.trim() !== "") {
      if (confirm("Заменить текущий текст шаблоном?")) {
        if (type === "response") {
          updateSettings({ fixedText: template })
        } else {
          updateSettings({ autoMessageText: template })
        }
      }
    } else {
      if (type === "response") {
        updateSettings({ fixedText: template })
      } else {
        updateSettings({ autoMessageText: template })
      }
    }
  }

  const getRatingColor = (rating: string) => {
    const num = Number.parseInt(rating)
    if (num <= 2) return "text-red-500"
    if (num === 3) return "text-yellow-500"
    return "text-green-500"
  }

  // Проверяем, нужно ли показывать блок автосообщений - теперь для оценок 1-4
  const showAutoMessages = ["1", "2", "3", "4"].includes(rating)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className={`h-5 w-5 ${getRatingColor(rating)}`} />
          {rating} ★
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Автоответы */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <h4 className="font-medium">Автоответы</h4>
          </div>

          <div className="flex flex-row items-start space-x-3 space-y-0">
            <Checkbox
              checked={settings.responseEnabled && canAutoanswer}
              onCheckedChange={(checked) => canAutoanswer && updateSettings({ responseEnabled: !!checked })}
              id={`responseEnabled-${rating}`}
              disabled={!canAutoanswer}
            />
            <div className="space-y-1 leading-none">
              <label
                htmlFor={`responseEnabled-${rating}`}
                className={`text-sm font-medium ${!canAutoanswer ? "text-gray-400" : "cursor-pointer"}`}
              >
                Включить автоответ
              </label>
            </div>
          </div>

          {settings.responseEnabled && canAutoanswer && (
            <div className="space-y-4 ml-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Тип ответа</Label>
                <RadioGroup
                  value={settings.responseType}
                  onValueChange={(value) => updateSettings({ responseType: value as "auto" | "fixed" })}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="auto" id={`auto-${rating}`} />
                    <label htmlFor={`auto-${rating}`} className="text-sm font-normal cursor-pointer">
                      Автоответ (GPT-4o-mini)
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="fixed" id={`fixed-${rating}`} />
                    <label htmlFor={`fixed-${rating}`} className="text-sm font-normal cursor-pointer">
                      Фиксированный текст
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {settings.responseType === "fixed" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Текст ответа</Label>
                  <Textarea
                    placeholder="Введите текст ответа на отзыв"
                    className="min-h-[100px]"
                    value={settings.fixedText}
                    onChange={(e) => updateSettings({ fixedText: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Автосообщения - показываем только для оценок 1-4 */}
        {showAutoMessages && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <h4 className="font-medium">Автосообщения</h4>
            </div>

            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox
                checked={settings.autoMessageEnabled && canAutodialog}
                onCheckedChange={(checked) => canAutodialog && updateSettings({ autoMessageEnabled: !!checked })}
                id={`autoMessageEnabled-${rating}`}
                disabled={!canAutodialog}
              />
              <div className="space-y-1 leading-none">
                <label
                  htmlFor={`autoMessageEnabled-${rating}`}
                  className={`text-sm font-medium ${!canAutodialog ? "text-gray-400" : "cursor-pointer"}`}
                >
                  Включить автосообщение
                </label>
              </div>
            </div>

            {settings.autoMessageEnabled && canAutodialog && (
              <div className="space-y-2 ml-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Текст сообщения</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleInsertTemplate("message")}>
                    Шаблон
                  </Button>
                </div>
                <Textarea
                  placeholder="Введите текст сообщения"
                  className="min-h-[120px]"
                  value={settings.autoMessageText}
                  onChange={(e) => updateSettings({ autoMessageText: e.target.value })}
                />
                <div className="text-xs text-gray-500">
                  Доступные переменные: {"{Name}"} - имя покупателя, {"{Product}"} - название товара, {"{Date1}"} - дата
                  оформления, {"{Date2}"} - дата получения, {"{Date3}"} - дата отзыва, {"{Price}"} - цена
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Функция для определения статуса автоответов
const getAutoResponseStatus = (account: WBAccountResponse) => {
  if (!account.settings?.auto_responses?.marks) return false
  return Object.values(account.settings.auto_responses.marks).some((mark: any) => mark.enabled)
}

// Функция для определения статуса автосообщений - учитываем теперь оценки 1-4
const getAutoMessageStatus = (account: WBAccountResponse) => {
  if (!account.settings?.auto_messages) return false

  // Проверяем оценки 1-4
  const relevantRatings = ["1", "2", "3", "4"]
  return Object.entries(account.settings.auto_messages)
    .filter(([rating]) => relevantRatings.includes(rating))
    .some(([_, message]: [string, any]) => message.enabled)
}

// Функция валидации хоста
const validateHost = (host: string): boolean => {
  if (!host || host.includes(" ") || host.includes("://")) {
    return false
  }

  // Проверка на IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (ipv4Regex.test(host)) {
    return true
  }

  // Проверка на IPv6 (упрощенная)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  if (ipv6Regex.test(host)) {
    return true
  }

  // Проверка на доменное имя
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return domainRegex.test(host)
}

// Функция валидации порта
const validatePort = (port: number): boolean => {
  return port >= 1 && port <= 65535
}

export function AccountSettingsForm({ accountId, onComplete }: AccountSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAccount, setIsLoadingAccount] = useState(true)
  const [accountData, setAccountData] = useState<WBAccountResponse | null>(null)
  const [accountName, setAccountName] = useState("")

  // Отдельные поля для куки
  const [authorizev3, setAuthorizev3] = useState("")
  const [wbxValidationKey, setWbxValidationKey] = useState("")
  const [apiKey, setApiKey] = useState("")

  // Состояние для проверки прокси
  const [isTestingProxy, setIsTestingProxy] = useState(false)

  const { refreshAccounts } = useAccounts()
  const { user } = useAuth()

  // Получаем права доступа пользователя
  const canAutoanswer = user?.features?.can_autoanswer ?? false
  const canAutodialog = user?.features?.can_autodialog ?? false

  // Состояние для всех рейтингов
  const [allRatingsSettings, setAllRatingsSettings] = useState<AllRatingsSettings>({
    "1": {
      responseEnabled: false,
      responseType: "auto",
      fixedText: "",
      autoMessageEnabled: false,
      autoMessageText: "",
    },
    "2": {
      responseEnabled: false,
      responseType: "auto",
      fixedText: "",
      autoMessageEnabled: false,
      autoMessageText: "",
    },
    "3": {
      responseEnabled: false,
      responseType: "auto",
      fixedText: "",
      autoMessageEnabled: false,
      autoMessageText: "",
    },
    "4": {
      responseEnabled: false,
      responseType: "auto",
      fixedText: "",
      autoMessageEnabled: false,
      autoMessageText: "",
    },
    "5": {
      responseEnabled: false,
      responseType: "auto",
      fixedText: "",
      autoMessageEnabled: false,
      autoMessageText: "",
    },
  })

  // Глобальные настройки
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    includeSignature: false,
    signature: "",
  })

  // Настройки прокси
  const [proxySettings, setProxySettings] = useState<ProxySettings>({
    enabled: false,
    protocol: "HTTP",
    host: "",
    port: null,
    username: "",
    password: "",
  })

  // Вычисляем статусы автоответов и автосообщений
  const autoResponsesEnabled = accountData ? getAutoResponseStatus(accountData) : false
  const autoMessagesEnabled = accountData ? getAutoMessageStatus(accountData) : false

  // Проверяем валидность настроек прокси
  const isProxyValid =
    proxySettings.enabled && validateHost(proxySettings.host) && proxySettings.port && validatePort(proxySettings.port)

  // Загрузка данных аккаунта
  useEffect(() => {
    const loadAccount = async () => {
      try {
        const account = await apiClient.getWBAccount(accountId)
        const normalizedAccount = normalizeAccountData(account)
        setAccountData(normalizedAccount)
        setAccountName(normalizedAccount.name)

        // Загружаем данные куки и API ключа
        setAuthorizev3(normalizedAccount.authorizev3 || "")
        setWbxValidationKey(normalizedAccount.wbx_validation_key || "")
        setApiKey(normalizedAccount.api_key || "")

        // Загружаем настройки для всех рейтингов
        const loadedSettings: AllRatingsSettings = {}
        for (const rating of ["1", "2", "3", "4", "5"]) {
          const autoResponse = normalizedAccount.settings.auto_responses.marks[rating] || {
            enabled: false,
            response_type: "auto",
            fixed_text: "",
          }

          const autoMessage = normalizedAccount.settings.auto_messages[rating] || {
            enabled: false,
            message_text: "",
          }

          loadedSettings[rating] = {
            responseEnabled: autoResponse.enabled,
            responseType: autoResponse.response_type,
            fixedText: autoResponse.fixed_text,
            autoMessageEnabled: autoMessage.enabled,
            autoMessageText: autoMessage.message_text,
          }
        }

        setAllRatingsSettings(loadedSettings)

        // Загружаем глобальные настройки
        setGlobalSettings({
          includeSignature: normalizedAccount.settings.auto_responses.include_signature,
          signature: normalizedAccount.settings.auto_responses.signature,
        })

        // Загружаем настройки прокси
        setProxySettings(normalizedAccount.settings.proxy)
      } catch (error) {
        console.error("Ошибка при загрузке данных аккаунта:", error)
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить данные аккаунта",
          variant: "destructive",
        })
      } finally {
        setIsLoadingAccount(false)
      }
    }

    loadAccount()
  }, [accountId])

  const handleRatingSettingsChange = (rating: string, newSettings: RatingSettings) => {
    // Если у пользователя нет прав на автоответы или автосообщения, не обновляем соответствующие настройки
    const updatedSettings = { ...newSettings }

    if (!canAutoanswer) {
      updatedSettings.responseEnabled = allRatingsSettings[rating].responseEnabled
      updatedSettings.responseType = allRatingsSettings[rating].responseType
      updatedSettings.fixedText = allRatingsSettings[rating].fixedText
    }

    if (!canAutodialog) {
      updatedSettings.autoMessageEnabled = allRatingsSettings[rating].autoMessageEnabled
      updatedSettings.autoMessageText = allRatingsSettings[rating].autoMessageText
    }

    setAllRatingsSettings((prev) => ({
      ...prev,
      [rating]: updatedSettings,
    }))
  }

  const handleInsertSignatureTemplate = () => {
    if (globalSettings.signature && globalSettings.signature.trim() !== "") {
      if (confirm("Заменить текущую подпись шаблоном?")) {
        setGlobalSettings((prev) => ({ ...prev, signature: defaultSignature }))
      }
    } else {
      setGlobalSettings((prev) => ({ ...prev, signature: defaultSignature }))
    }
  }

  const handleTestProxyConnection = async () => {
    if (!isProxyValid) {
      toast({
        title: "Ошибка валидации",
        description: "Проверьте правильность настроек прокси",
        variant: "destructive",
      })
      return
    }

    if (!accountData?.sid) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить sid аккаунта",
        variant: "destructive",
      })
      return
    }

    setIsTestingProxy(true)

    try {
      const result = await apiClient.testProxyConnection({
        protocol: proxySettings.protocol,
        host: proxySettings.host,
        port: proxySettings.port!,
        username: proxySettings.username || undefined,
        password: proxySettings.password || undefined,
        sid: accountData.sid,
      })

      // Проверяем, есть ли данные в ответе (может быть в result.data или напрямую в result)
      const responseData = result.data || result
      const checks = responseData?.Checks || {}
      const overall = responseData?.Overall

      if (overall && checks) {
        // Создаем детальное сообщение о проверках
        const checkMessages = []

        if (checks.MyIP === "OK") {
          checkMessages.push("✅ Прокси работает")
        } else {
          checkMessages.push("❌ Прокси недоступен")
        }

        if (checks.WB_API === "OK") {
          checkMessages.push("✅ Доступ к API WB")
        } else {
          checkMessages.push("❌ Нет доступа к API WB")
        }

        if (checks.WB_LK === "OK") {
          checkMessages.push("✅ Доступ к ЛК WB")
        } else {
          checkMessages.push("❌ Нет доступа к ЛК WB")
        }

        const isAllOk = overall === "OK"

        toast({
          title: isAllOk ? "Проверка прокси успешна" : "Проблемы с прокси",
          description: checkMessages.join(", "),
          variant: isAllOk ? "default" : "destructive",
        })
      } else {
        toast({
          title: "Ошибка подключения",
          description: result.message || "Не удалось проверить подключение к прокси",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Ошибка при тестировании прокси:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось проверить подключение",
        variant: "destructive",
      })
    } finally {
      setIsTestingProxy(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!accountData) {
        throw new Error("Данные аккаунта не загружены")
      }

      // Создаем обновленные настройки
      const updatedSettings = {
        auto_responses: {
          marks: {} as any,
          include_signature: globalSettings.includeSignature,
          signature: globalSettings.signature || "",
        },
        auto_messages: {} as any,
      }

      // Заполняем настройки для всех рейтингов
      for (const [rating, settings] of Object.entries(allRatingsSettings)) {
        updatedSettings.auto_responses.marks[rating] = {
          enabled: settings.responseEnabled,
          response_type: settings.responseType,
          fixed_text: settings.fixedText || "",
        }

        updatedSettings.auto_messages[rating] = {
          enabled: settings.autoMessageEnabled,
          message_text: settings.autoMessageText || "",
        }
      }

      // Подготавливаем данные для обновления
      const updateData: any = {
        name: accountName,
        settings: updatedSettings,
        // Отправляем прокси настройки на верхнем уровне
        proxy_enabled: proxySettings.enabled,
        proxy_protocol: proxySettings.enabled ? proxySettings.protocol : null,
        proxy_host: proxySettings.enabled && proxySettings.host ? proxySettings.host : null,
        proxy_port: proxySettings.enabled && proxySettings.port ? proxySettings.port : null,
        proxy_username: proxySettings.enabled && proxySettings.username ? proxySettings.username : null,
        proxy_password: proxySettings.enabled && proxySettings.password ? proxySettings.password : null,
      }

      // Добавляем куки и API ключ если они заполнены
      if (authorizev3.trim()) {
        updateData.authorizev3 = authorizev3.trim()
      }
      if (wbxValidationKey.trim()) {
        updateData.wbx_validation_key = wbxValidationKey.trim()
      }
      if (apiKey.trim()) {
        updateData.api_key = apiKey.trim()
      }

      // Отправляем обновленные настройки
      const updatedAccount = await apiClient.updateWBAccount(accountId, updateData)
      const normalizedUpdatedAccount = normalizeAccountData(updatedAccount)
      setAccountData(normalizedUpdatedAccount)

      // Обновляем список аккаунтов в контексте
      await refreshAccounts()

      toast({
        title: "Настройки сохранены",
        description: "Все настройки успешно сохранены",
      })

      // Если есть callback, вызываем его
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Ошибка при сохранении настроек:", error)

      let errorMessage = "Не удалось сохранить настройки"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingAccount) {
    return (
      <div className="space-y-6">
        {/* Прелоадер для информации об аккаунте */}
        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Прелоадер для данных подключения */}
        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Прелоадер для настроек автоматизации */}
        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Прелоадер для кнопок */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-full sm:w-24"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-full sm:w-32"></div>
        </div>
      </div>
    )
  }

  if (!accountData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-500">Не удалось загрузить данные аккаунта</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Информация об аккаунте */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Информация об аккаунте</CardTitle>
          <CardDescription className="text-sm">Основные данные и статусы подключения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Название аккаунта</Label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Введите название аккаунта"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Название магазина</Label>
              <Input value={accountData.store_name || "Не указано"} readOnly className="bg-gray-50 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">ИНН</Label>
              <Input value={accountData.inn || "Не указан"} readOnly className="bg-gray-50 mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">ID поставщика</Label>
              <Input value={accountData.supplier_id || "Не указан"} readOnly className="bg-gray-50 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Статус куки</Label>
                {accountData.cookie_status ? (
                  <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3" /> Активна
                  </Badge>
                ) : (
                  <Badge className="flex items-center gap-1 bg-red-100 text-red-800 hover:bg-red-100">
                    <X className="h-3 w-3" /> Ошибка
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Статус API</Label>
                {accountData.api_status ? (
                  <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3" /> Активен
                  </Badge>
                ) : (
                  <Badge className="flex items-center gap-1 bg-red-100 text-red-800 hover:bg-red-100">
                    <X className="h-3 w-3" /> Ошибка
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Соответствие</Label>
                {accountData.match_status ? (
                  <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3" /> Соответствует
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Несоответствие
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Автоответы</Label>
                {autoResponsesEnabled ? (
                  <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3" /> Включены
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Выключены
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Автодиалоги</Label>
                {autoMessagesEnabled ? (
                  <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3" /> Включены
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Выключены
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Прокси</Label>
                {proxySettings.enabled ? (
                  <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Globe className="h-3 w-3" /> Включен
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Выключен
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Данные подключения */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Key className="h-5 w-5" />
              Данные подключения
            </CardTitle>
            <InstructionDialog />
          </div>
          <CardDescription className="text-sm">Обновите куки и API ключ для подключения к Wildberries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Cookie данные
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">authorizev3</Label>
                <Input
                  placeholder="Введите значение authorizev3"
                  value={authorizev3}
                  onChange={(e) => setAuthorizev3(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">wbx-validation-key</Label>
                <Input
                  placeholder="Введите значение wbx-validation-key"
                  value={wbxValidationKey}
                  onChange={(e) => setWbxValidationKey(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Key className="h-4 w-4" />
              API ключ
            </Label>
            <Input
              placeholder="Введите API ключ Wildberries"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1"
            />
            <div className="text-xs text-gray-500 mt-1">
              API ключ с правами на чтение статистики и управление отзывами
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки прокси */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Globe className="h-5 w-5" />
            Прокси
          </CardTitle>
          <CardDescription className="text-sm">Настройте прокси-сервер для подключения к Wildberries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row items-start space-x-3 space-y-0">
            <Checkbox
              checked={proxySettings.enabled}
              onCheckedChange={(checked) => {
                if (checked && !accountData?.sid) {
                  toast({
                    title: "Требуется sid аккаунта",
                    description: "Для использования прокси необходим sid аккаунта",
                    variant: "destructive",
                  })
                  return
                }
                setProxySettings((prev) => ({ ...prev, enabled: !!checked }))
              }}
              id="proxyEnabled"
              disabled={!accountData?.sid}
            />
            <div className="space-y-1 leading-none">
              <label htmlFor="proxyEnabled" className="text-sm font-medium cursor-pointer">
                Использовать прокси
              </label>
              {!accountData?.sid && (
                <div className="text-xs text-gray-500">Для использования прокси необходим sid аккаунта</div>
              )}
            </div>
          </div>

          {proxySettings.enabled && (
            <div className="space-y-4 ml-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Протокол</Label>
                <Select
                  value={proxySettings.protocol}
                  onValueChange={(value: "HTTP" | "HTTPS" | "SOCKS5") =>
                    setProxySettings((prev) => ({ ...prev, protocol: value }))
                  }
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                    <SelectItem value="HTTPS">HTTPS</SelectItem>
                    <SelectItem value="SOCKS5">SOCKS5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Host</Label>
                  <Input
                    placeholder="proxy.example.com или 192.168.1.10"
                    value={proxySettings.host}
                    onChange={(e) => setProxySettings((prev) => ({ ...prev, host: e.target.value }))}
                    className={!validateHost(proxySettings.host) && proxySettings.host ? "border-red-500" : ""}
                  />
                  {!validateHost(proxySettings.host) && proxySettings.host && (
                    <div className="text-xs text-red-500">
                      Некорректный формат хоста. Используйте доменное имя или IP-адрес без схемы
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Port</Label>
                  <Input
                    type="number"
                    min="1"
                    max="65535"
                    placeholder="Введите порт"
                    value={proxySettings.port || ""}
                    onChange={(e) =>
                      setProxySettings((prev) => ({
                        ...prev,
                        port: e.target.value ? Number.parseInt(e.target.value) : null,
                      }))
                    }
                    className={proxySettings.port && !validatePort(proxySettings.port) ? "border-red-500" : ""}
                  />
                  {proxySettings.port && !validatePort(proxySettings.port) && (
                    <div className="text-xs text-red-500">Порт должен быть от 1 до 65535</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Логин</Label>
                <Input
                  placeholder="Введите логин"
                  value={proxySettings.username}
                  onChange={(e) => setProxySettings((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Пароль</Label>
                <Input
                  type="text"
                  placeholder="Введите пароль"
                  value={proxySettings.password}
                  onChange={(e) => setProxySettings((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestProxyConnection}
                  disabled={!isProxyValid || isTestingProxy}
                  className="gap-2 bg-transparent"
                >
                  {isTestingProxy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Проверка...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Проверить подключение
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Настройки автоматизации */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Настройки автоматизации</CardTitle>
          <CardDescription className="text-sm">Настройте автоответы и автосообщения для каждой оценки</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Общее уведомление о недоступности функций */}
          {(!canAutoanswer || !canAutodialog) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800 mb-1">Расширенные функции автоматизации</p>
                  <div className="text-sm text-blue-700 mb-3">
                    {!canAutoanswer && !canAutodialog && (
                      <p>
                        Автоответы и автосообщения доступны в расширенной версии. Пополните баланс для доступа к этим
                        функциям.
                      </p>
                    )}
                    {!canAutoanswer && canAutodialog && (
                      <p>Автоответы доступны в расширенной версии. Пополните баланс для доступа к этой функции.</p>
                    )}
                    {canAutoanswer && !canAutodialog && (
                      <p>Автосообщения доступны в расширенной версии. Пополните баланс для доступа к этой функции.</p>
                    )}
                  </div>
                  <Link href="/dashboard/billing">
                    <Button size="sm" className="gap-2">
                      <CreditCard className="h-4 w-4" />
                      Пополнить баланс
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Настройки для каждой оценки */}
          {["1", "2", "3", "4", "5"].map((rating) => (
            <RatingSettingsCard
              key={rating}
              rating={rating}
              settings={allRatingsSettings[rating]}
              onSettingsChange={handleRatingSettingsChange}
            />
          ))}

          {/* Подпись для автоответов */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Подпись для автоответов</CardTitle>
              <CardDescription className="text-sm">
                Общая подпись, которая будет добавляться ко всем автоответам
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row items-start space-x-3 space-y-0">
                <Checkbox
                  checked={globalSettings.includeSignature && canAutoanswer}
                  onCheckedChange={(checked) =>
                    canAutoanswer && setGlobalSettings((prev) => ({ ...prev, includeSignature: !!checked }))
                  }
                  id="includeSignature"
                  disabled={!canAutoanswer}
                />
                <div className="space-y-1 leading-none">
                  <label
                    htmlFor="includeSignature"
                    className={`text-sm font-medium ${!canAutoanswer ? "text-gray-400" : "cursor-pointer"}`}
                  >
                    Добавлять подпись ко всем автоответам
                  </label>
                </div>
              </div>

              {globalSettings.includeSignature && canAutoanswer && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label className="text-sm font-medium">Текст подписи</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleInsertSignatureTemplate}>
                      Шаблон
                    </Button>
                  </div>
                  <Textarea
                    placeholder={defaultSignature}
                    className="min-h-[80px]"
                    value={globalSettings.signature}
                    onChange={(e) => setGlobalSettings((prev) => ({ ...prev, signature: e.target.value }))}
                  />
                  <div className="text-xs text-gray-500">
                    При сохранении цифры будут заменены на символы, а некоторые буквы изменены для обхода фильтров
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onComplete}
          disabled={isLoading}
          className="w-full sm:w-auto bg-transparent"
        >
          Пропустить
        </Button>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить все настройки"
          )}
        </Button>
      </div>
    </form>
  )
}
