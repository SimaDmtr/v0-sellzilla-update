"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const plans = [
  {
    id: "basic",
    name: "Базовый",
    price: 1990,
    description: "Для начинающих продавцов",
    features: ["До 3 аккаунтов WB", "Автоответы на отзывы", "Базовая аналитика", "Email поддержка"],
  },
  {
    id: "pro",
    name: "Профессиональный",
    price: 3990,
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
    price: 7990,
    description: "Для крупного бизнеса",
    features: [
      "Неограниченно аккаунтов",
      "Все функции автоматизации",
      "Полная аналитика",
      "API доступ",
      "Персональный менеджер",
    ],
  },
]

interface SubscriptionPlanSelectorProps {
  onPlanSelect?: (planId: string) => void
  selectedPlan?: string
}

export function SubscriptionPlanSelector({ onPlanSelect, selectedPlan }: SubscriptionPlanSelectorProps) {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4">
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
          <Card
            key={plan.id}
            className={`relative cursor-pointer transition-all ${
              selectedPlan === plan.id ? "border-blue-500 shadow-lg" : ""
            } ${plan.popular ? "border-blue-300" : ""}`}
            onClick={() => onPlanSelect?.(plan.id)}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">Популярный</Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {isYearly ? Math.round(plan.price * 0.8).toLocaleString() : plan.price.toLocaleString()}
                </span>
                <span className="text-gray-600 ml-2">₽/{isYearly ? "год" : "мес"}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
