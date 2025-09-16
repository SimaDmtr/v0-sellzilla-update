"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import type { WBAccountResponse } from "@/lib/types"

interface AutoMessageSettingsProps {
  account: WBAccountResponse
  onUpdate: (account: WBAccountResponse) => void
}

export function AutoMessageSettings({ account, onUpdate }: AutoMessageSettingsProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const settings = account.settings?.auto_messages || {}

  const handleToggle = async (rating: string, enabled: boolean) => {
    setIsSaving(true)
    try {
      const updatedSettings = {
        ...account.settings,
        auto_messages: {
          ...settings,
          [rating]: {
            ...settings[rating],
            enabled,
          },
        },
      }

      const updatedAccount = await apiClient.updateAccountSettings(account.id, updatedSettings)
      onUpdate(updatedAccount)

      toast({
        title: "Успешно",
        description: `Автосообщения для ${rating} ${rating === "1" ? "звезды" : "звезд"} ${enabled ? "включены" : "выключены"}`,
      })
    } catch (error) {
      console.error("Ошибка обновления настроек:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить настройки",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleMessageUpdate = async (rating: string, field: string, value: string | number) => {
    setIsSaving(true)
    try {
      const updatedSettings = {
        ...account.settings,
        auto_messages: {
          ...settings,
          [rating]: {
            ...settings[rating],
            [field]: value,
          },
        },
      }

      const updatedAccount = await apiClient.updateAccountSettings(account.id, updatedSettings)
      onUpdate(updatedAccount)

      toast({
        title: "Успешно",
        description: "Настройки автосообщений обновлены",
      })
    } catch (error) {
      console.error("Ошибка обновления настроек:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить настройки",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case "1":
        return "1 звезда"
      case "2":
        return "2 звезды"
      case "3":
        return "3 звезды"
      case "4":
        return "4 звезды"
      default:
        return `${rating} звезд`
    }
  }

  const showAutoMessages = (rating: string) => {
    // Показываем автосообщения для оценок 1-4
    return ["1", "2", "3", "4"].includes(rating)
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Автосообщения отправляются покупателям, которые оставили отзывы с низкими оценками. Это помогает улучшить
        отношения с клиентами и решить возможные проблемы.
      </div>

      <Tabs defaultValue="1" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {["1", "2", "3", "4"].map((rating) => (
            <TabsTrigger key={rating} value={rating} className="relative">
              {getRatingLabel(rating)}
              {settings[rating]?.enabled && <Badge variant="default" className="ml-2 h-2 w-2 p-0 rounded-full" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {["1", "2", "3", "4"].map((rating) => {
          if (!showAutoMessages(rating)) return null

          const ratingSettings = settings[rating] || {
            enabled: false,
            message: "",
            delay_hours: 24,
          }

          return (
            <TabsContent key={rating} value={rating}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Автосообщения для {getRatingLabel(rating)}</CardTitle>
                      <CardDescription>
                        Настройте автоматические сообщения для отзывов с оценкой {rating}{" "}
                        {rating === "1" ? "звезда" : "звезды"}
                      </CardDescription>
                    </div>
                    <Switch
                      checked={ratingSettings.enabled}
                      onCheckedChange={(enabled) => handleToggle(rating, enabled)}
                      disabled={isSaving}
                    />
                  </div>
                </CardHeader>

                {ratingSettings.enabled && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`message-${rating}`}>Текст сообщения</Label>
                      <Textarea
                        id={`message-${rating}`}
                        value={ratingSettings.message}
                        onChange={(e) => handleMessageUpdate(rating, "message", e.target.value)}
                        placeholder={`Введите текст автосообщения для отзывов с оценкой ${rating} ${rating === "1" ? "звезда" : "звезды"}...`}
                        className="min-h-[100px]"
                        disabled={isSaving}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Используйте переменные: {"{name}"} - имя покупателя, {"{product}"} - название товара
                      </p>
                    </div>

                    <div>
                      <Label htmlFor={`delay-${rating}`}>Задержка отправки (часы)</Label>
                      <Input
                        id={`delay-${rating}`}
                        type="number"
                        min="1"
                        max="168"
                        value={ratingSettings.delay_hours}
                        onChange={(e) => handleMessageUpdate(rating, "delay_hours", Number.parseInt(e.target.value))}
                        disabled={isSaving}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Сообщение будет отправлено через указанное количество часов после получения отзыва
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Пример сообщения:</h4>
                      <p className="text-blue-800 text-sm">
                        {ratingSettings.message ||
                          `Здравствуйте! Спасибо за ваш отзыв с оценкой ${rating} ${rating === "1" ? "звезда" : "звезды"}. Мы ценим вашу обратную связь и хотели бы улучшить качество нашего товара.`}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
