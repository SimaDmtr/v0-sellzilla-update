"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, MessageSquare, Shield, Zap, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <p className="text-sm text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Если пользователь авторизован, не показываем главную страницу
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-semibold text-xl text-black tracking-tight">SellZilla</div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-black font-medium">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button className="minimal-button h-9 px-4">Начать</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-light text-black mb-6 text-balance leading-tight">
            Аналитика отзывов
            <br />
            <span className="font-semibold">Wildberries</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto text-balance leading-relaxed">
            Управляйте репутацией, анализируйте отзывы и автоматизируйте ответы покупателям
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="minimal-button h-12 px-8 text-base">
                Начать бесплатно
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="minimal-button-outline h-12 px-8 text-base bg-transparent">
                Посмотреть тарифы
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-black mb-4">Возможности</h2>
            <p className="text-gray-600 text-lg">Всё необходимое для управления отзывами</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center staggered-item">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-black mb-2">Аналитика</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Детальная статистика по отзывам и покупателям</p>
            </div>

            <div className="text-center staggered-item">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-black mb-2">Автоответы</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Автоматические ответы на отзывы покупателей</p>
            </div>

            <div className="text-center staggered-item">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-black mb-2">Защита</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Выявление и удаление недобросовестных отзывов</p>
            </div>

            <div className="text-center staggered-item">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-black mb-2">Автоматизация</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Настройка автоматических сообщений</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="staggered-item">
              <div className="text-4xl font-light text-black mb-2">1000+</div>
              <div className="text-gray-600">Активных продавцов</div>
            </div>
            <div className="staggered-item">
              <div className="text-4xl font-light text-black mb-2">50k+</div>
              <div className="text-gray-600">Обработанных отзывов</div>
            </div>
            <div className="staggered-item">
              <div className="text-4xl font-light text-black mb-2">4.8</div>
              <div className="text-gray-600">Средний рейтинг клиентов</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-4">Готовы начать?</h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Присоединяйтесь к продавцам, которые уже улучшили свою репутацию
          </p>
          <Link href="/register">
            <Button className="bg-white text-black hover:bg-gray-100 h-12 px-8 text-base font-semibold">
              Начать бесплатно
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="font-semibold text-xl text-black mb-4 md:mb-0 tracking-tight">SellZilla</div>
            <div className="flex gap-8 text-sm text-gray-600">
              <Link href="/offer" className="hover:text-black transition-colors font-medium">
                Оферта
              </Link>
              <Link href="/contacts" className="hover:text-black transition-colors font-medium">
                Контакты
              </Link>
              <Link href="/privacy" className="hover:text-black transition-colors font-medium">
                Конфиденциальность
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            © 2025 SellZilla. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  )
}
