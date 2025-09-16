"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/context/auth-context"

// Enable static optimization for this page
export const dynamic = "force-static"
export const revalidate = 3600 // Revalidate every hour

const plans = [
  {
    name: "Базовый",
    price: "1 990",
    period: "месяц",
    description: "Для начинающих продавцов",
    features: ["До 3 аккаунтов WB", "Автоответы на отзывы", "Базовая аналитика", "Email поддержка"],
    popular: false,
  },
  {
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

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={user ? "/dashboard" : "/"} prefetch={true}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Выберите тарифный план</h1>
          <p className="text-xl text-gray-600 mb-8">Начните автоматизировать работу с отзывами уже сегодня</p>

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
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? "border-blue-500 shadow-lg" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">Популярный</Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {isYearly ? Math.round(Number.parseInt(plan.price) * 0.8).toLocaleString() : plan.price}
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
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  Выбрать план
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Нужна помощь в выборе тарифа?</p>
          <Button variant="outline">Связаться с нами</Button>
        </div>
      </div>
    </div>
  )
}
