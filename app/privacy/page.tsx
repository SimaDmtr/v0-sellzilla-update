"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"

export default function PrivacyPage() {
  const [language, setLanguage] = useState<"ru" | "en">("ru")

  useEffect(() => {
    // Check URL params, localStorage, or browser language
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get("lang") as "ru" | "en" | null
    const savedLang = localStorage.getItem("sellzilla_privacy_lang") as "ru" | "en" | null
    const browserLang = navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en"

    const initialLang = urlLang || savedLang || browserLang
    setLanguage(initialLang === "en" ? "en" : "ru")
  }, [])

  const handleLanguageChange = (lang: "ru" | "en") => {
    setLanguage(lang)
    localStorage.setItem("sellzilla_privacy_lang", lang)

    const url = new URL(window.location.href)
    url.searchParams.set("lang", lang)
    window.history.replaceState(null, "", url.toString())
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-bold text-lg sm:text-xl hover:text-primary transition-colors">
            Sellzilla
          </Link>
          <DashboardNav variant="desktop" />
        </div>
        <UserNav />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="relative">
            <div className="absolute top-4 right-4 flex gap-2 bg-muted/50 border rounded-full p-1">
              <Button
                variant={language === "ru" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleLanguageChange("ru")}
                className="rounded-full px-3 py-1 h-8"
              >
                RU
              </Button>
              <Button
                variant={language === "en" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleLanguageChange("en")}
                className="rounded-full px-3 py-1 h-8"
              >
                EN
              </Button>
            </div>

            <CardContent className="p-8">
              {language === "ru" ? (
                <div className="text-foreground">
                  <h1 className="text-3xl font-bold mb-4 text-foreground">Политика конфиденциальности</h1>
                  <p className="text-muted-foreground mb-6">
                    Дата вступления в силу: <strong className="text-foreground">11.09.2025</strong>
                  </p>

                  <div className="space-y-6 text-foreground">
                    <p className="text-foreground leading-relaxed">
                      <strong>SellZilla WB Auth Auto‑Sync</strong> («Расширение») разработано и поддерживается компанией{" "}
                      <strong>SellZilla</strong> («мы», «нас», «наш»). Настоящая Политика объясняет, как Расширение
                      обрабатывает данные при установке и использовании в Google Chrome.
                    </p>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">1. Какие данные мы собираем</h2>
                      <p className="text-foreground leading-relaxed mb-3">
                        Расширение получает только те данные, которые необходимы для синхронизации вашего кабинета
                        продавца Wildberries:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">authorizev3</code> (токен
                          авторизации)
                        </li>
                        <li>
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">wbx-validation-key</code>
                        </li>
                        <li>
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">SID</code> (идентификатор
                          сессии/аккаунта)
                        </li>
                      </ul>
                      <p className="text-foreground leading-relaxed mt-3">
                        Иные персональные данные Расширением не собираются.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">2. Цели использования данных</h2>
                      <p className="text-foreground leading-relaxed mb-3">
                        Собранные данные передаются по защищённому каналу только на наш сервер{" "}
                        <strong>https://api.sellzilla.club</strong> и используются исключительно для:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>синхронизации ваших аккаунтов продавца Wildberries с платформой SellZilla;</li>
                        <li>обеспечения корректной работы процессов подключения и синхронизации.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        3. Передача данных третьим лицам
                      </h2>
                      <p className="text-foreground leading-relaxed">
                        Мы <strong>не</strong> продаём, не сдаём в аренду и не передаём ваши данные третьим лицам.
                        Данные обмениваются только между вашим браузером и нашими серверами для указанных целей.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">4. Хранение и удаление данных</h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>Данные хранятся только пока ваш аккаунт в SellZilla активен.</li>
                        <li>Вы можете запросить удаление данных в любой момент, связавшись с нами.</li>
                        <li>
                          При удалении аккаунта SellZilla все связанные данные (включая токены и идентификаторы сессий)
                          безвозвратно удаляются из наших систем.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        5. Контроль со стороны пользователя
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>Вы можете в любой момент удалить Расширение, чтобы прекратить сбор токенов.</li>
                        <li>Вы можете запросить полное удаление хранящихся у нас данных, связавшись с нами.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">6. Безопасность</h2>
                      <p className="text-foreground leading-relaxed">
                        Мы применяем разумные административные и технические меры для защиты данных при передаче и
                        хранении.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">7. Контакты</h2>
                      <p className="text-foreground leading-relaxed">
                        По вопросам, связанным с настоящей Политикой или обработкой данных, свяжитесь с нами:{" "}
                        <a href="mailto:info@sellzilla.club" className="text-primary hover:underline font-medium">
                          info@sellzilla.club
                        </a>
                        .
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Страница публикации:{" "}
                        <a href="https://sellzilla.club/privacy" className="text-primary hover:underline">
                          https://sellzilla.club/privacy
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-foreground">
                  <h1 className="text-3xl font-bold mb-4 text-foreground">Privacy Policy</h1>
                  <p className="text-muted-foreground mb-6">
                    Effective date: <strong className="text-foreground">2025-09-11</strong>
                  </p>

                  <div className="space-y-6 text-foreground">
                    <p className="text-foreground leading-relaxed">
                      <strong>SellZilla WB Auth Auto‑Sync</strong> ("Extension") is developed and operated by{" "}
                      <strong>SellZilla</strong> ("we", "our", "us"). This Privacy Policy explains how the Extension
                      handles data when installed and used in Google Chrome.
                    </p>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">1. Information We Collect</h2>
                      <p className="text-foreground leading-relaxed mb-3">
                        The Extension collects only the data required to sync your Wildberries Seller account:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">authorizev3</code> token
                        </li>
                        <li>
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">wbx-validation-key</code>
                        </li>
                        <li>
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">SID</code>{" "}
                          (session/account identifier)
                        </li>
                      </ul>
                      <p className="text-foreground leading-relaxed mt-3">
                        No other personal information is collected by the Extension.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">2. How We Use the Information</h2>
                      <p className="text-foreground leading-relaxed mb-3">
                        The collected data is transmitted securely only to our backend service at{" "}
                        <strong>https://api.sellzilla.club</strong> and used exclusively to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>Synchronize your Wildberries Seller accounts with the SellZilla platform;</li>
                        <li>Ensure the functionality of your account connection and synchronization processes.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">3. Data Sharing</h2>
                      <p className="text-foreground leading-relaxed">
                        We <strong>do not</strong> sell, rent, or share your data with third parties. Data is exchanged
                        only between your browser and our servers for the stated purposes.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">4. Data Retention & Deletion</h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>Data is retained only while your SellZilla account remains active.</li>
                        <li>You may request deletion of your data at any time by contacting us.</li>
                        <li>
                          When you delete your SellZilla account, all associated data (including tokens and session
                          identifiers) is permanently removed from our systems.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">5. User Control</h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>You can uninstall the Extension at any time to stop token collection.</li>
                        <li>You may request complete data deletion by contacting us.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">6. Security</h2>
                      <p className="text-foreground leading-relaxed">
                        We apply reasonable administrative and technical measures to protect data during transmission
                        and storage.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">7. Contact</h2>
                      <p className="text-foreground leading-relaxed">
                        If you have any questions about this Privacy Policy or our data practices, contact us at{" "}
                        <a href="mailto:info@sellzilla.club" className="text-primary hover:underline font-medium">
                          info@sellzilla.club
                        </a>
                        .
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Published at:{" "}
                        <a href="https://sellzilla.club/privacy" className="text-primary hover:underline">
                          https://sellzilla.club/privacy
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
