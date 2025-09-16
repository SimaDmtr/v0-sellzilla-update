"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, MessageSquare, Settings } from "lucide-react"

const navigation = [
  {
    name: "Обзор",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Отзывы",
    href: "/dashboard/reviews",
    icon: MessageSquare,
  },
  {
    name: "Настройки",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

interface DashboardNavProps {
  variant?: "desktop" | "mobile"
  onItemClick?: () => void
}

export function DashboardNav({ variant = "desktop", onItemClick }: DashboardNavProps) {
  const pathname = usePathname()

  if (variant === "mobile") {
    return (
      <nav className="flex flex-col space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="hidden lg:flex space-x-1 lg:space-x-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
