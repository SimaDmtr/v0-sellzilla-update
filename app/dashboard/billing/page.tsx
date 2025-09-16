"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { useBalance } from "@/lib/context/balance-context"
import { Loader2, CreditCard, Wallet, ExternalLink, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { Slider } from "@/components/ui/slider"

type PaymentState = "form" | "pending" | "succeeded" | "failed" | "canceled"

export default function BillingPage() {
  const [amount, setAmount] = useState<number>(20000)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentState, setPaymentState] = useState<PaymentState>("form")
  const [paymentUrl, setPaymentUrl] = useState<string>("")
  const [paymentId, setPaymentId] = useState<string>("")
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const { toast } = useToast()
  const { refreshBalance } = useBalance()
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Очистка интервала при размонтировании компонента
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Функция для проверки статуса платежа
  const checkPaymentStatus = async (id: string) => {
    try {
      const status = await apiClient.getPaymentStatus(id)

      if (status.status === "succeeded") {
        setPaymentState("succeeded")
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }

        // Обновляем баланс после успешного платежа
        await refreshBalance()

        toast({
          title: "Платеж успешен!",
          description: "Баланс обновлен",
          variant: "default",
        })
      } else if (status.status === "failed" || status.status === "canceled") {
        setPaymentState(status.status)
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        toast({
          title: "Ошибка оплаты",
          description: status.status === "failed" ? "Платеж не прошел" : "Платеж отменен",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Ошибка проверки статуса платежа:", error)
    }
  }

  // Запуск polling
  const startPolling = (id: string) => {
    // Очищаем предыдущий интервал если есть
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Запускаем новый интервал
    pollingIntervalRef.current = setInterval(() => {
      checkPaymentStatus(id)
    }, 5000)

    // Первая проверка сразу
    checkPaymentStatus(id)
  }

  const handleQuickAmount = (value: number) => {
    setAmount(value)
  }

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму для пополнения",
        variant: "destructive",
      })
      return
    }

    if (amount < 20000) {
      toast({
        title: "Ошибка",
        description: "Минимальная сумма пополнения: 20 000 рублей",
        variant: "destructive",
      })
      return
    }

    if (amount > 100000) {
      toast({
        title: "Ошибка",
        description: "Максимальная сумма пополнения: 100 000 рублей",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.createPayment(amount)

      toast({
        title: "Перенаправление на оплату",
        description: "Вы будете перенаправлены для совершения оплаты",
      })

      setPaymentUrl(response.confirmation_url)
      setPaymentId(response.yk_payment_id)
      setPaymentAmount(amount)
      setPaymentState("pending")

      // Запускаем polling
      startPolling(response.yk_payment_id)

      // Небольшая задержка для показа уведомления
      setTimeout(() => {
        window.open(response.confirmation_url, "_blank")
      }, 1000)
    } catch (error) {
      console.error("Ошибка создания платежа:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать платеж",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewPayment = () => {
    // Останавливаем polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    setPaymentState("form")
    setPaymentUrl("")
    setPaymentId("")
    setPaymentAmount(0)
    setAmount(20000)
  }

  const handleReopenPayment = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank")
    }
  }

  const renderPaymentContent = () => {
    switch (paymentState) {
      case "pending":
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Ожидание оплаты</h3>
              <p className="text-muted-foreground">
                Завершите платеж на сумму <span className="font-semibold">{paymentAmount.toLocaleString()} ₽</span>
              </p>
              <p className="text-sm text-muted-foreground">Автоматически отслеживаем статус платежа...</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleReopenPayment} variant="outline" className="w-full bg-transparent">
                <ExternalLink className="mr-2 h-4 w-4" />
                Открыть окно оплаты повторно
              </Button>
              <Button onClick={handleNewPayment} variant="ghost" className="w-full">
                Создать новый платеж
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Что происходит?</p>
                  <p className="text-blue-700 mt-1">
                    Мы автоматически отслеживаем статус вашего платежа. После успешной оплаты баланс будет пополнен.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "succeeded":
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-900">Оплата прошла успешно!</h3>
              <p className="text-muted-foreground">
                Баланс пополнен на <span className="font-semibold">{paymentAmount.toLocaleString()} ₽</span>
              </p>
            </div>

            <Button onClick={handleNewPayment} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Пополнить еще
            </Button>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Готово!</p>
                  <p className="text-green-700 mt-1">Средства зачислены на ваш баланс и доступны для использования.</p>
                </div>
              </div>
            </div>
          </div>
        )

      case "failed":
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-900">Платеж не прошел</h3>
              <p className="text-muted-foreground">
                Не удалось обработать платеж на сумму{" "}
                <span className="font-semibold">{paymentAmount.toLocaleString()} ₽</span>
              </p>
            </div>

            <Button onClick={handleNewPayment} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Создать новый платеж
            </Button>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-900">Что делать?</p>
                  <p className="text-red-700 mt-1">
                    Проверьте данные карты и попробуйте еще раз. При повторных проблемах обратитесь в поддержку.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "canceled":
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-orange-900">Платеж отменен</h3>
              <p className="text-muted-foreground">
                Платеж на сумму <span className="font-semibold">{paymentAmount.toLocaleString()} ₽</span> был отменен
              </p>
            </div>

            <Button onClick={handleNewPayment} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Создать новый платеж
            </Button>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900">Платеж отменен</p>
                  <p className="text-orange-700 mt-1">Вы можете создать новый платеж в любое время.</p>
                </div>
              </div>
            </div>
          </div>
        )

      default: // form
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Сумма пополнения: {amount.toLocaleString()} ₽</Label>
                <Slider
                  id="amount"
                  min={20000}
                  max={100000}
                  step={5000}
                  value={[amount]}
                  onValueChange={(value) => setAmount(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20 000 ₽</span>
                  <span>100 000 ₽</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Быстрый выбор суммы</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[20000, 30000, 50000, 70000, 85000, 100000].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant={amount === quickAmount ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQuickAmount(quickAmount)}
                      className="text-sm"
                    >
                      {quickAmount.toLocaleString()} ₽
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handlePayment} disabled={isLoading || !amount || amount <= 0} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание платежа...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Оплатить {amount.toLocaleString()} ₽
                </>
              )}
            </Button>
          </>
        )
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Пополнение баланса</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Форма пополнения или состояние платежа */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {paymentState === "pending" && (
                <>
                  <Clock className="h-5 w-5 text-blue-500" />
                  Ожидание оплаты
                </>
              )}
              {paymentState === "succeeded" && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Оплата успешна
                </>
              )}
              {(paymentState === "failed" || paymentState === "canceled") && (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  {paymentState === "failed" ? "Ошибка оплаты" : "Платеж отменен"}
                </>
              )}
              {paymentState === "form" && (
                <>
                  <CreditCard className="h-5 w-5" />
                  Пополнить баланс
                </>
              )}
            </CardTitle>
            <CardDescription>
              {paymentState === "form" && "Введите сумму для пополнения баланса вашего аккаунта"}
              {paymentState === "pending" && "Завершите оплату в открывшемся окне"}
              {paymentState === "succeeded" && "Баланс успешно пополнен"}
              {paymentState === "failed" && "Произошла ошибка при обработке платежа"}
              {paymentState === "canceled" && "Платеж был отменен пользователем"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">{renderPaymentContent()}</CardContent>
        </Card>

        {/* Информация о платежах */}
        <Card>
          <CardHeader>
            <CardTitle>Информация о платежах</CardTitle>
            <CardDescription>Важная информация о пополнении баланса</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Безопасные платежи</p>
                  <p className="text-sm text-muted-foreground">
                    Все платежи обрабатываются через защищенную систему ЮMoney
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Автоматическое отслеживание</p>
                  <p className="text-sm text-muted-foreground">Мы автоматически отслеживаем статус вашего платежа</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Способы оплаты</p>
                  <p className="text-sm text-muted-foreground">
                    Банковские карты, электронные кошельки, интернет-банкинг
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Поддержка 24/7</p>
                  <p className="text-sm text-muted-foreground">
                    При возникновении проблем обращайтесь в службу поддержки
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Внимание:</strong> После создания платежа мы автоматически отслеживаем его статус и уведомляем о
                результате.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
