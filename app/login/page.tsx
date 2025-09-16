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
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Введите корректный email",
  }),
  password: z.string().min(1, {
    message: "Введите пароль",
  }),
})

const verificationFormSchema = z.object({
  code: z.string().length(6, {
    message: "Код должен содержать 6 цифр",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, verifyLogin, isAuthenticated } = useAuth() // Убрал isLoading из useAuth
  const [step, setStep] = useState<"login" | "verification">("login")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Новое состояние для лоадера формы

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const verificationForm = useForm<z.infer<typeof verificationFormSchema>>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      code: "",
    },
  })

  async function onLoginSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsSubmitting(true) // Начинаем загрузку
    try {
      const result = await login(values.email, values.password)

      if (result.success) {
        setEmail(values.email)
        setStep("verification")
        toast({
          title: "Код отправлен",
          description: result.message || "Проверьте ваш email",
        })
      } else {
        toast({
          title: "Ошибка входа",
          description: result.message || "Не удалось войти в систему",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false) // Заканчиваем загрузку
    }
  }

  async function onVerificationSubmit(values: z.infer<typeof verificationFormSchema>) {
    setIsSubmitting(true) // Начинаем загрузку
    try {
      const result = await verifyLogin(email, values.code)

      if (result.success) {
        toast({
          title: "Авторизация успешна",
          description: "Добро пожаловать в SellZilla",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Ошибка подтверждения",
          description: result.message || "Неверный код подтверждения",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false) // Заканчиваем загрузку
    }
  }

  const handleBackToLogin = () => {
    setStep("login")
    verificationForm.reset()
  }

  useEffect(() => {
    if (step === "verification") {
      verificationForm.reset({ code: "" })
    }
  }, [step, verificationForm])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Link>
          <h1 className="text-2xl font-medium text-black mb-2">SellZilla</h1>
          <p className="text-gray-600">{step === "login" ? "Вход в аккаунт" : "Подтверждение входа"}</p>
        </div>

        <div className="minimal-card p-6">
          {step === "login" ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
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

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium text-gray-700">Пароль</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-gray-500 hover:text-black transition-colors"
                        >
                          Забыли?
                        </Link>
                      </div>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="minimal-input h-10 pr-10"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting} // Используем isSubmitting
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="minimal-button w-full h-10 mt-6" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    "Войти"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...verificationForm} key="verification-form">
              <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Код отправлен на <span className="font-medium">{email}</span>
                  </p>
                </div>

                <FormField
                  control={verificationForm.control}
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

                            // Автоматическая отправка при достижении 6 символов
                            if (value.length === 6 && !isSubmitting) {
                              // Используем isSubmitting
                              setTimeout(() => {
                                verificationForm.handleSubmit(onVerificationSubmit)()
                              }, 100)
                            }
                          }}
                          disabled={isSubmitting} // Используем isSubmitting
                          autoComplete="one-time-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="minimal-button w-full h-10 mt-6"
                  disabled={isSubmitting || verificationForm.watch("code").length !== 6} // Используем isSubmitting
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Проверка...
                    </>
                  ) : (
                    "Подтвердить"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-black transition-colors"
                    onClick={handleBackToLogin}
                    disabled={isSubmitting} // Используем isSubmitting
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
            Нет аккаунта?{" "}
            <Link href="/register" className="text-black hover:underline font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
