"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { Loader2, HelpCircle, AlertTriangle, Copy, Check, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { useAccounts } from "@/lib/context/accounts-context"
import { useBalance } from "@/lib/context/balance-context"

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
        <Button variant="link" className="p-0 h-auto text-blue-600">
          Открыть инструкцию
          <HelpCircle className="ml-1 h-3 w-3" />
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

interface AddAccountDialogProps {
  children: React.ReactNode
}

export function AddAccountDialog({ children }: AddAccountDialogProps) {
  const { addAccountOptimistic } = useAccounts()
  const { updateBalanceFromData } = useBalance()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Простые состояния для полей формы
  const [name, setName] = useState("")
  const [authorizev3, setAuthorizev3] = useState("")
  const [wbxValidationKey, setWbxValidationKey] = useState("")
  const [apiKey, setApiKey] = useState("")

  // Состояния для ошибок
  const [errors, setErrors] = useState({
    name: "",
    authorizev3: "",
    wbx_validation_key: "",
    api_key: "",
  })

  const validateForm = () => {
    const newErrors = {
      name: "",
      authorizev3: "",
      wbx_validation_key: "",
      api_key: "",
    }

    if (!name.trim()) {
      newErrors.name = "Название аккаунта обязательно"
    }

    if (!authorizev3.trim()) {
      newErrors.authorizev3 = "Токен авторизации обязателен"
    }

    if (!wbxValidationKey.trim()) {
      newErrors.wbx_validation_key = "Ключ валидации обязателен"
    }

    if (!apiKey.trim()) {
      newErrors.api_key = "API ключ обязателен"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const data = {
        name: name.trim(),
        authorizev3: authorizev3.trim(),
        wbx_validation_key: wbxValidationKey.trim(),
        api_key: apiKey.trim(),
      }

      console.log("Добавляем аккаунт:", data.name)
      const response = await apiClient.addWBAccount(data)
      console.log("Аккаунт добавлен, ответ сервера:", response)

      // Оптимистично добавляем аккаунт в локальное состояние
      addAccountOptimistic(response)

      // ОБНОВЛЯЕМ БАЛАНС И СРАЗУ ИСПОЛЬЗУЕМ ПОЛУЧЕННЫЕ ДАННЫЕ
      console.log("Обновляем баланс после добавления аккаунта...")
      try {
        const balanceData = await apiClient.getUserBalance()
        console.log("✅ Получены данные баланса после добавления:", balanceData)
        updateBalanceFromData(balanceData)
        console.log("✅ Баланс успешно обновлен после добавления")
      } catch (balanceError) {
        console.error("❌ Ошибка обновления баланса после добавления:", balanceError)
      }

      toast({
        title: "Аккаунт добавлен",
        description: "Аккаунт успешно добавлен в систему",
      })

      // Закрываем диалог и сбрасываем форму
      handleCancel()
    } catch (error) {
      console.error("Ошибка при добавлении аккаунта:", error)

      let errorMessage = "Не удалось добавить аккаунт. Попробуйте позже."

      if (error instanceof Error) {
        errorMessage = error.message
      }

      // Показываем детальную ошибку с переносами строк
      toast({
        title: "Ошибка при добавлении аккаунта",
        description: <div className="whitespace-pre-line text-sm max-w-sm">{errorMessage}</div>,
        variant: "destructive",
        duration: 10000, // Увеличиваем время показа для длинных ошибок
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    // Сбрасываем все поля
    setName("")
    setAuthorizev3("")
    setWbxValidationKey("")
    setApiKey("")
    setErrors({
      name: "",
      authorizev3: "",
      wbx_validation_key: "",
      api_key: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Добавить аккаунт Wildberries</DialogTitle>
          <DialogDescription>Подключите ваш аккаунт Wildberries для управления отзывами</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Для подключения аккаунта вам потребуются данные из личного кабинета Wildberries. <InstructionDialog />
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Название аккаунта</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Мой магазин Wildberries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                <p className="text-sm text-gray-500">Произвольное название для удобства</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorizev3">Токен авторизации (authorizev3)</Label>
                <Textarea
                  id="authorizev3"
                  placeholder="Вставьте токен авторизации из localStorage"
                  className={`min-h-[100px] font-mono text-sm ${errors.authorizev3 ? "border-red-500" : ""}`}
                  value={authorizev3}
                  onChange={(e) => setAuthorizev3(e.target.value)}
                />
                {errors.authorizev3 && <p className="text-sm text-red-500">{errors.authorizev3}</p>}
                <p className="text-sm text-gray-500">
                  Токен авторизации из localStorage кабинета Wildberries. Используйте JavaScript код из инструкции для
                  автоматического получения.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wbx_validation_key">Ключ валидации (wbx_validation_key)</Label>
                <Input
                  id="wbx_validation_key"
                  type="text"
                  placeholder="Ключ валидации из cookies"
                  value={wbxValidationKey}
                  onChange={(e) => setWbxValidationKey(e.target.value)}
                  className={errors.wbx_validation_key ? "border-red-500" : ""}
                />
                {errors.wbx_validation_key && <p className="text-sm text-red-500">{errors.wbx_validation_key}</p>}
                <p className="text-sm text-gray-500">Ключ валидации из cookies браузера</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">API ключ</Label>
                <Input
                  id="api_key"
                  type="text"
                  placeholder="API ключ из настроек кабинета"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={errors.api_key ? "border-red-500" : ""}
                />
                {errors.api_key && <p className="text-sm text-red-500">{errors.api_key}</p>}
                <p className="text-sm text-gray-500">API ключ из раздела "Настройки → Доступ к API"</p>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Отмена
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Добавление..." : "Добавить аккаунт"}
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
