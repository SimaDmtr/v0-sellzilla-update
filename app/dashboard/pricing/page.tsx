"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/context/auth-context"
import { useSubscription } from "@/lib/context/subscription-context"

const plans = [
  {
    id: "basic",
    name: "Базовый",
    price: "1 990",
    period: "месяц",
    description: "Для начинающих продавцов",
    features: ["До 3 аккаунтов WB", "Автоответы на отзывы", "Базовая аналитика", "Email поддержка"],
    popular: false,
  },
  {
    id: "pro",
    name: "Профессиональный",
    price: "3 990",
    period: "месяц",
    description: "Для активных продавцов",
    features: [
      "До 10 аккаунтов WB",
      "Автоответы + автосообщения",
      "Расширенная аналитика",
      "Экспорт данных",
      "Приоритетная поддержка",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Корпоративный",
    price: "7 990",
    period: "месяц",
    description: "Для крупного бизнеса",
    features: [
      "Неограниченно аккаунтов",
      "Все функции автоматизации",
      "Полная аналитика",
      "API доступ",
      "Персональный менеджер",
    ],
    popular: false,
  },
]

export default function DashboardPricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const { user } = useAuth()
  const { subscription } = useSubscription()

  const handlePlanSelect = (planId: string) => {
    // Здесь будет логика выбора плана
    console.log("Selected plan:", planId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к дашборду
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление подпиской</h1>
        <p className="text-gray-600">
          Текущий план: <span className="font-semibold">{subscription?.displayText || "Не активен"}</span>
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={`text-sm ${!isYearly ? "font-semibold" : ""}`}>Месячная оплата</span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isYearly ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isYearly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm ${isYearly ? "font-semibold" : ""}`}>
          Годовая оплата
          <Badge variant="secondary" className="ml-2">
            -20%
          </Badge>
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? "border-blue-500 shadow-lg" : ""}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">Популярный</Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {isYearly
                    ? Math.round(Number.parseInt(plan.price.replace(/\s/g, "")) * 0.8).toLocaleString()
                    : plan.price}
                </span>
                <span className="text-gray-600 ml-2">₽/{isYearly ? "год" : plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handlePlanSelect(plan.id)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Выбрать план
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Способы оплаты</CardTitle>
          <CardDescription>Выберите удобный способ оплаты</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-center p-4 border rounded-lg">
              <span className="text-sm font-medium">Банковская карта</span>
            </div>
            <div className="flex items-center justify-center p-4 border rounded-lg">
              <span className="text-sm font-medium">СБП</span>
            </div>
            <div className="flex items-center justify-center p-4 border rounded-lg">
              <span className="text-sm font-medium">ЮMoney</span>
            </div>
            <div className="flex items-center justify-center p-4 border rounded-lg">
              <span className="text-sm font-medium">QIWI</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
