"use client"

import { AccountsList } from "@/components/accounts-list"
import { FeedbackChart } from "@/components/feedback-chart"
import { useAccounts } from "@/lib/context/accounts-context"

export default function DashboardPage() {
  const { accounts, isLoading: isLoadingAccounts } = useAccounts()

  const hasAccounts = accounts && accounts.length > 0

  return (
    <div className="container py-4 sm:py-8 px-4 lg:px-8">
      {/* Список аккаунтов вверху */}
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Аккаунты Wildberries</h2>
      <div className="mb-8">
        <AccountsList />
      </div>

      {/* Раздел для динамики отзывов (график) */}
      {isLoadingAccounts ? (
        <div className="text-center text-gray-500 py-8">Загрузка аккаунтов...</div>
      ) : hasAccounts ? (
        <>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Динамика отзывов</h2>
          <div className="mb-8">
            <FeedbackChart />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Для отображения статистики добавьте хотя бы один аккаунт Wildberries.
        </div>
      )}
    </div>
  )
}
