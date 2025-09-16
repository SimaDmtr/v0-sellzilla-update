"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"

export default function OfferPage() {
  const [language, setLanguage] = useState<"ru" | "en">("ru")

  useEffect(() => {
    // Check URL params, localStorage, or browser language
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get("lang") as "ru" | "en" | null
    const savedLang = localStorage.getItem("sellzilla_offer_lang") as "ru" | "en" | null
    const browserLang = navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en"

    const initialLang = urlLang || savedLang || browserLang
    setLanguage(initialLang === "en" ? "en" : "ru")
  }, [])

  const handleLanguageChange = (lang: "ru" | "en") => {
    setLanguage(lang)
    localStorage.setItem("sellzilla_offer_lang", lang)

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
                  <h1 className="text-3xl font-bold mb-4 text-foreground">
                    Публичная оферта на оказание услуг SellZilla
                  </h1>
                  <div className="flex items-center gap-4 mb-6 text-muted-foreground">
                    <span>
                      Дата публикации: <strong className="text-foreground">16.09.2025</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Юрисдикция: <Badge variant="secondary">Российская Федерация</Badge>
                    </span>
                  </div>

                  <div className="space-y-6 text-foreground">
                    <p className="text-foreground leading-relaxed">
                      Настоящая публичная оферта (далее — «Оферта») является официальным предложением{" "}
                      <strong>Индивидуального предпринимателя Абубакировой Малики Султановны</strong> (ИНН
                      201403124750), далее — «Исполнитель», заключить договор возмездного оказания услуг (далее —
                      «Договор») с любым дееспособным лицом — «Пользователем», на условиях, изложенных ниже.
                    </p>
                    <p className="text-foreground leading-relaxed">
                      <strong>Акцепт Оферты:</strong> регистрация/вход в личный кабинет, пополнение баланса и/или
                      выражение согласия в интерфейсе Сервиса. С момента Акцепта Пользователь считается заключившим
                      Договор на условиях Оферты.
                    </p>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">1. Предмет</h2>
                      <p className="text-foreground leading-relaxed">
                        Предоставление доступа к функциональности SaaS‑сервиса <strong>SellZilla</strong> для
                        автоматизации и аналитики работы с кабинетом продавца Wildberries («WB»). Сервис не является
                        продуктом WB и не аффилирован с ним.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        2. Учётная запись и ограничения
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          В личный кабинет можно добавить не более <strong>10</strong> магазинов WB.
                        </li>
                        <li>
                          Удаление добавленного магазина возможно не ранее чем через <strong>30</strong> календарных
                          дней с даты добавления.
                        </li>
                        <li>Пользователь обеспечивает конфиденциальность доступа и актуальность учётных данных.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        3. Тарифы, подневное списание, продление
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          Оплата услуг осуществляется по модели <strong>подневного списания</strong> с баланса за каждый
                          календарный день доступа.
                        </li>
                        <li>
                          <strong>Пример расчёта:</strong> базовая цена — <em>20 000</em> ₽/мес за 1 аккаунт WB; каждый
                          дополнительный аккаунт +<em>5 000</em> ₽/мес. Дневная ставка:{" "}
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">
                            (20 000 + 5 000 × (N − 1)) / 30
                          </code>
                          .
                        </li>
                        <li>
                          Продление доступа происходит автоматически при наличии положительного остатка на балансе. При
                          отсутствии средств доступ может быть приостановлен до пополнения.
                        </li>
                        <li>
                          Пополнение баланса доступно фиксированными суммами: <strong>20 000</strong>,{" "}
                          <strong>30 000</strong>,<strong>50 000</strong>, <strong>70 000</strong>,{" "}
                          <strong>85 000</strong>, <strong>100 000</strong> ₽.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        4. Платежи через ЮKassa (YooKassa) и 54‑ФЗ
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          Приём платежей осуществляется через платёжный сервис <strong>ЮKassa</strong> (ООО НКО
                          «ЮКасса»). Доступные способы оплаты (банковские карты, СБП и др.) указываются в интерфейсе.
                        </li>
                        <li>
                          Данные банковской карты обрабатываются на стороне ЮKassa в соответствии с требованиями
                          платёжных систем и стандартом <strong>PCI DSS</strong>. Исполнитель не хранит реквизиты карт.
                        </li>
                        <li>
                          Кассовые чеки формируются и направляются в соответствии с Федеральным законом № 54‑ФЗ на
                          контактные данные, указанные Пользователем (email/телефон).
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">5. Возвраты и претензии</h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          В случае подтверждённых сбоев в работе Сервиса возврат возможен в размере{" "}
                          <strong>не более 20 000 ₽</strong>
                          на исходный способ оплаты через ЮKassa; сроки зачисления определяются правилами платёжных
                          систем и банка‑эмитента.
                        </li>
                        <li>
                          Пополняя баланс на сумму свыше <strong>20 000 ₽</strong>, Пользователь подтверждает качество
                          услуг на момент операции и <strong>отказывается</strong> от претензий и возвратов сверх
                          указанного предела (с соблюдением императивных норм закона).
                        </li>
                        <li>
                          Претензионный порядок обязателен: направьте описание проблемы на{" "}
                          <a href="mailto:info@sellzilla.club" className="text-primary hover:underline font-medium">
                            info@sellzilla.club
                          </a>
                          . Срок ответа — 10 рабочих дней.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        6. Данные и 152‑ФЗ (персональные данные)
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          Сервис хранит минимально необходимые данные Пользователя для оказания услуг:{" "}
                          <strong>API‑ключ/куки</strong> WB (включая{" "}
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">authorizev3</code>,{" "}
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">wbx-validation-key</code>
                          ), а также данные, необходимые для аналитики заказов/отзывов.
                        </li>
                        <li>
                          Сведения о покупателях WB отображаются из данных WB и, как правило, не сохраняются в Сервисе.
                        </li>
                        <li>
                          В части данных покупателей обработка осуществляется как обработка{" "}
                          <strong>по поручению оператора</strong>
                          (Пользователя) в целях исполнения Договора (ст. 6 ч. 3 Закона № 152‑ФЗ). Акцептом Оферты
                          стороны заключают поручение на обработку.
                        </li>
                        <li>
                          Исполнитель вправе привлекать субобработчиков (хостинг/связь) при соблюдении
                          конфиденциальности и безопасности.
                        </li>
                        <li>
                          Подробности — в{" "}
                          <Link href="/privacy" className="text-primary hover:underline font-medium">
                            Политике конфиденциальности
                          </Link>
                          .
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        7. Ограничения и отказ от гарантий
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          Сервис предоставляется <strong>«как есть»</strong> и <strong>«как доступно»</strong> без
                          гарантий непрерывности и безошибочности.
                        </li>
                        <li>
                          WB вправе изменять API, интерфейсы и правила; Исполнитель не гарантирует совместимость при
                          таких изменениях.
                        </li>
                        <li>Запрещено использовать Сервис с нарушением закона, прав третьих лиц и правил площадок.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">8. Ответственность</h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          Исполнитель не отвечает за прямые/косвенные убытки от действий/изменений со стороны WB и иных
                          третьих лиц, а также за упущенную выгоду.
                        </li>
                        <li>
                          Совокупная ответственность Исполнителя ограничена суммой, уплаченной за последние 30 дней, но
                          не более <strong>20 000 ₽</strong>.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        9. Приостановка, изменение и расторжение
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          Доступ может быть приостановлен при нарушении Оферты/закона либо при недостаточном балансе.
                        </li>
                        <li>
                          Исполнитель вправе изменять условия Оферты, публикуя актуальную версию на сайте; продолжение
                          использования означает согласие с изменениями.
                        </li>
                        <li>
                          Пользователь вправе прекратить использование в любое время; удаление данных — по{" "}
                          <Link href="/privacy" className="text-primary hover:underline font-medium">
                            Политике конфиденциальности
                          </Link>
                          .
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">10. Применимое право и споры</h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          К Договору применяется право Российской Федерации (включая ГК РФ, 152‑ФЗ, 54‑ФЗ и иные
                          применимые акты).
                        </li>
                        <li>
                          Споры подлежат рассмотрению в суде по месту регистрации Исполнителя после соблюдения
                          претензионного порядка.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">11. Реквизиты Исполнителя</h2>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-foreground">
                          <strong>Наименование:</strong> Индивидуальный предприниматель Абубакирова Малика Султановна
                        </p>
                        <p className="text-foreground">
                          <strong>ИНН:</strong> 201403124750
                        </p>
                        <p className="text-foreground">
                          <strong>Email:</strong>{" "}
                          <a href="mailto:info@sellzilla.club" className="text-primary hover:underline font-medium">
                            info@sellzilla.club
                          </a>
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6">
                      Языковые версии: данный русский текст имеет приоритет. Английская версия приводится для удобства.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-foreground">
                  <h1 className="text-3xl font-bold mb-4 text-foreground">
                    Public Offer (Services Agreement) — SellZilla
                  </h1>
                  <div className="flex items-center gap-4 mb-6 text-muted-foreground">
                    <span>
                      Publication date: <strong className="text-foreground">2025-09-16</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Governing law: <Badge variant="secondary">Russian Federation</Badge>
                    </span>
                  </div>

                  <div className="space-y-6 text-foreground">
                    <p className="text-foreground leading-relaxed">
                      This Public Offer (the "Offer") is an official proposal by{" "}
                      <strong>Individual Entrepreneur Malika Sultanovna Abubakirova</strong> (INN 201403124750, the
                      "Provider") to enter into a paid services agreement (the "Agreement") with any capable person (the
                      "User") on the terms below. By registering/logging in, topping up the balance and/or explicitly
                      agreeing in the interface, the User accepts the Offer and enters into the Agreement.
                    </p>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">1. Subject</h2>
                      <p className="text-foreground leading-relaxed">
                        Access to the <strong>SellZilla</strong> SaaS platform for automation and analytics for
                        Wildberries ("WB") Seller accounts. The Service is not a WB product and is not affiliated with
                        WB.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">2. Account and limitations</h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          Up to <strong>10</strong> WB stores may be added to the dashboard.
                        </li>
                        <li>
                          A store can be removed not earlier than <strong>30</strong> calendar days from the date it was
                          added.
                        </li>
                        <li>
                          The User is responsible for safeguarding access credentials and keeping account data up to
                          date.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        3. Pricing, daily charge, renewal
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          Fees are charged on a <strong>daily</strong> basis from the User's balance for each calendar
                          day of access.
                        </li>
                        <li>
                          <strong>Example:</strong> base price — <em>20,000</em> RUB/month for 1 WB account; each
                          additional account +<em>5,000</em> RUB/month. Daily rate:{" "}
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">
                            (20,000 + 5,000 × (N − 1)) / 30
                          </code>
                          .
                        </li>
                        <li>
                          Access renews automatically while a positive balance is maintained. If the balance is
                          insufficient, access may be suspended until the balance is topped up.
                        </li>
                        <li>
                          Top‑up options (RUB): <strong>20,000</strong>, <strong>30,000</strong>,{" "}
                          <strong>50,000</strong>,<strong>70,000</strong>, <strong>85,000</strong>,{" "}
                          <strong>100,000</strong>.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        4. Payments via YooKassa and fiscal receipts
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          Payments are processed via <strong>YooKassa</strong> (Non‑bank credit organization "YooKassa"
                          LLC). Available methods (bank cards, SBP, etc.) are shown in the interface.
                        </li>
                        <li>
                          Card data is processed by YooKassa in accordance with payment system rules and{" "}
                          <strong>PCI DSS</strong>. The Provider does not store card details.
                        </li>
                        <li>
                          Fiscal receipts are issued and delivered under the Russian Federal Law No. 54‑FZ to the User's
                          contact details (email/phone).
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">5. Refunds and claims</h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          If Service malfunctions are confirmed, a refund of up to <strong>20,000 RUB</strong> may be
                          issued to the original payment method via YooKassa; posting times depend on the payment
                          systems and issuing bank.
                        </li>
                        <li>
                          By topping up more than <strong>20,000 RUB</strong>, the User confirms the Service quality at
                          the moment of the operation and <strong>waives</strong> claims and refunds beyond that limit
                          (subject to mandatory legal norms).
                        </li>
                        <li>
                          Pre‑trial claim procedure is mandatory: please email details to{" "}
                          <a href="mailto:info@sellzilla.club" className="text-primary hover:underline font-medium">
                            info@sellzilla.club
                          </a>
                          . Response time: 10 business days.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        6. Data and privacy (Law No. 152‑FZ)
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          The Service stores only minimal data needed to provide the Services: WB{" "}
                          <strong>API key/cookies</strong>
                          (including{" "}
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">authorizev3</code>,{" "}
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground">wbx-validation-key</code>
                          ) and data required for orders/reviews analytics.
                        </li>
                        <li>Buyer data from WB is displayed and generally not stored by the Service.</li>
                        <li>
                          Regarding buyers' data, processing is carried out as{" "}
                          <strong>processing by instruction</strong> of the data controller (the User) for the purpose
                          of performing the Agreement (Art. 6(3) of Federal Law No. 152‑FZ). By accepting the Offer, the
                          parties enter into a data processing instruction.
                        </li>
                        <li>
                          The Provider may involve sub‑processors (hosting/connectivity) subject to confidentiality and
                          security.
                        </li>
                        <li>
                          See our{" "}
                          <Link href="/privacy" className="text-primary hover:underline font-medium">
                            Privacy Policy
                          </Link>{" "}
                          for details.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        7. Limitations and warranty disclaimer
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          The Service is provided <strong>"as is"</strong> and <strong>"as available"</strong> without
                          warranties of uninterrupted or error‑free operation.
                        </li>
                        <li>
                          WB may change its APIs, interfaces and rules; compatibility with such changes is not
                          guaranteed.
                        </li>
                        <li>
                          Use of the Service must comply with applicable law, third‑party rights and platform rules.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">8. Liability</h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          The Provider is not liable for direct/indirect losses arising from actions/changes by WB or
                          other third parties, nor for lost profits.
                        </li>
                        <li>
                          The Provider's aggregate liability is limited to the fees actually paid for the last 30 days,
                          but not more than <strong>20,000 RUB</strong>.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        9. Suspension, changes, termination
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>Access may be suspended in case of Offer/law violations or insufficient balance.</li>
                        <li>
                          The Provider may amend the Offer by publishing an updated version; continued use constitutes
                          acceptance of changes.
                        </li>
                        <li>
                          The User may stop using the Service at any time; data deletion is governed by the{" "}
                          <Link href="/privacy" className="text-primary hover:underline font-medium">
                            Privacy Policy
                          </Link>
                          .
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">
                        10. Governing law and disputes
                      </h2>
                      <ul className="list-disc pl-6 space-y-2 text-foreground">
                        <li>
                          This Agreement is governed by the laws of the Russian Federation (including the Civil Code,
                          Law No. 152‑FZ, Law No. 54‑FZ and other applicable acts).
                        </li>
                        <li>
                          Disputes shall be resolved by the court at the Provider's place of registration after the
                          pre‑trial claim procedure.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">11. Provider details</h2>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-foreground">
                          <strong>Name:</strong> Individual Entrepreneur Malika Sultanovna Abubakirova
                        </p>
                        <p className="text-foreground">
                          <strong>INN (Tax ID):</strong> 201403124750
                        </p>
                        <p className="text-foreground">
                          <strong>Email:</strong>{" "}
                          <a href="mailto:info@sellzilla.club" className="text-primary hover:underline font-medium">
                            info@sellzilla.club
                          </a>
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6">
                      Language versions: the Russian text prevails. The English version is provided for convenience.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Published at:{" "}
                  <a href="https://sellzilla.club/offer" className="text-primary hover:underline">
                    https://sellzilla.club/offer
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
