import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/lib/context/auth-context"
import { BalanceProvider } from "@/lib/context/balance-context"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sellzilla Analytics",
  description: "Аналитика и управление отзывами Wildberries",
  generator: "v0.app",
  robots: "noindex, nofollow",
}

// Enable static optimization where possible
export const dynamic = "auto"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <BalanceProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </BalanceProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
