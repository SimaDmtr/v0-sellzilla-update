"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, Smartphone, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check push notification support and subscription status
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true)

      // Check if already subscribed
      navigator.serviceWorker.ready
        .then((registration) => {
          return registration.pushManager.getSubscription()
        })
        .then((subscription) => {
          setPushSubscribed(!!subscription)
          setPushEnabled(!!subscription)
        })
        .catch((error) => {
          console.error("Error checking push subscription:", error)
        })
    }
  }, [])

  // Convert base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    try {
      if (!base64String || typeof base64String !== "string") {
        throw new Error("Invalid base64 string provided")
      }

      const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

      const rawData = window.atob(base64)
      const outputArray = new Uint8Array(rawData.length)

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
      }
      return outputArray
    } catch (error) {
      console.error("Error converting base64 to Uint8Array:", error)
      throw new Error("Failed to process VAPID key")
    }
  }

  const handlePushToggle = async (enabled: boolean) => {
    if (!pushSupported) {
      toast({
        title: "Не поддерживается",
        description: "Ваш браузер не поддерживает push-уведомления",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (enabled) {
        // Request permission
        const permission = await Notification.requestPermission()

        if (permission !== "granted") {
          toast({
            title: "Разрешение отклонено",
            description: "Для получения уведомлений необходимо разрешить их в браузере",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register("/sw.js")
        await navigator.serviceWorker.ready

        // Get VAPID public key from server
        const vapidResponse = await fetch("/api/push/vapid-key")
        if (!vapidResponse.ok) {
          throw new Error("Failed to get VAPID key")
        }

        const { publicKey } = await vapidResponse.json()

        if (!publicKey) {
          throw new Error("No VAPID public key received")
        }

        console.log("VAPID public key received:", publicKey)

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

        console.log("Push subscription created:", subscription)

        // Send subscription to server
        const response = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        })

        if (!response.ok) {
          throw new Error("Failed to save subscription")
        }

        setPushEnabled(true)
        setPushSubscribed(true)

        toast({
          title: "Уведомления включены",
          description: "Вы будете получать push-уведомления о важных событиях",
        })
      } else {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          await subscription.unsubscribe()

          // Remove subscription from server
          await fetch("/api/push/unsubscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          })
        }

        setPushEnabled(false)
        setPushSubscribed(false)

        toast({
          title: "Уведомления отключены",
          description: "Вы больше не будете получать push-уведомления",
        })
      }
    } catch (error) {
      console.error("Push notification error:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось настроить уведомления",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      const response = await fetch("/api/push/test", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to send test notification")
      }

      toast({
        title: "Тестовое уведомление отправлено",
        description: "Проверьте, получили ли вы push-уведомление",
      })
    } catch (error) {
      console.error("Test notification error:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось отправить тестовое уведомление",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground mt-2">Управляйте настройками уведомлений и безопасности</p>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Уведомления
            </CardTitle>
            <CardDescription>Настройте способы получения уведомлений</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">Push-уведомления</Label>
                  {pushSupported ? (
                    pushSubscribed ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Активны
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <Smartphone className="h-3 w-3 mr-1" />
                        Доступны
                      </Badge>
                    )
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Не поддерживается
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Получайте мгновенные уведомления о новых отзывах и важных событиях
                </p>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={handlePushToggle} disabled={!pushSupported || isLoading} />
            </div>

            {pushEnabled && pushSubscribed && (
              <div className="ml-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Push-уведомления настроены и работают</p>
                <Button variant="outline" size="sm" onClick={sendTestNotification}>
                  Отправить тестовое уведомление
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Безопасность
            </CardTitle>
            <CardDescription>Настройки безопасности и конфиденциальности</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Двухфакторная аутентификация</Label>
                <p className="text-sm text-muted-foreground">Дополнительный уровень защиты для вашего аккаунта</p>
              </div>
              <Button variant="outline">Настроить</Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Изменить пароль</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input type="password" placeholder="Текущий пароль" />
                <Input type="password" placeholder="Новый пароль" />
              </div>
              <Button>Обновить пароль</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
