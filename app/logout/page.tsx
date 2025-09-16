"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
      } catch (error) {
        console.error("Logout error:", error)
      } finally {
        // Всегда перенаправляем на логин, независимо от результата
        router.replace("/login")
      }
    }

    performLogout()
  }, [logout, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Выход из системы...</p>
      </div>
    </div>
  )
}
