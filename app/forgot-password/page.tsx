"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { ArrowLeft, Loader2 } from "lucide-react"

const emailFormSchema = z.object({
  email: z.string().email({
    message: "Введите корректный email",
  }),
})

const resetFormSchema = z
  .object({
    code: z.string().length(6, {
      message: "Код должен содержать 6 цифр",
    }),
    new_password: z.string().min(8, {
      message: "Пароль должен содержать минимум 8 символов",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [step, setStep] = useState<"email" | "reset">("email")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  })

  const resetForm = useForm<z.infer<typeof resetFormSchema>>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      code: "",
      new_password: "",
      confirmPassword: "",
    },
  })

  async function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("https://api.sellzilla.club/auth/reset-password-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: values.email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setEmail(values.email)
      setStep("reset")
      toast({
        title: "Код отправлен",
        description: data.message || "Проверьте ваш email",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка отправки кода"
      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onResetSubmit(values: z.infer<typeof resetFormSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("https://api.sellzilla.club/auth/reset-password-confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: values.code,
          new_password: values.new_password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      toast({
        title: "Пароль изменен",
        description: "Пароль успешно изменен. Теперь вы можете войти с новым паролем.",
      })
      router.push("/login")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка сброса пароля"
      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep("email")
    resetForm.reset()
  }

  useEffect(() => {
    if (step === "reset") {
      resetForm.reset({ code: "", new_password: "", confirmPassword: "" })
    }
  }, [step, resetForm])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />К входу
          </Link>
          <h1 className="text-2xl font-medium text-black mb-2">SellZilla</h1>
          <p className="text-gray-600">{step === "email" ? "Восстановление пароля" : "Новый пароль"}</p>
        </div>

        <div className="minimal-card p-6">
          {step === "email" ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">Введите email, на который зарегистрирован ваш аккаунт</p>
                </div>

                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" className="minimal-input h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="minimal-button w-full h-10 mt-6" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    "Получить код"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetForm} key="reset-form">
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Код отправлен на <span className="font-medium">{email}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input value={email} disabled className="minimal-input h-10 bg-gray-50 text-gray-500" />
                </div>

                <FormField
                  control={resetForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Код подтверждения</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="000000"
                          className="minimal-input h-10 text-center text-lg tracking-widest"
                          maxLength={6}
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                            field.onChange(value)
                          }}
                          disabled={isLoading}
                          autoComplete="one-time-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Новый пароль</FormLabel>
                      <FormControl>
                        <Input type="password" className="minimal-input h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Подтверждение пароля</FormLabel>
                      <FormControl>
                        <Input type="password" className="minimal-input h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="minimal-button w-full h-10 mt-6"
                  disabled={isLoading || resetForm.watch("code").length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    "Сбросить пароль"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-black transition-colors"
                    onClick={handleBackToEmail}
                    disabled={isLoading}
                  >
                    Назад
                  </button>
                </div>
              </form>
            </Form>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Вспомнили пароль?{" "}
            <Link href="/login" className="text-black hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
