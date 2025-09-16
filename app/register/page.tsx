"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react" // Добавил Eye, EyeOff

const registerFormSchema = z
  .object({
    email: z.string().email({
      message: "Введите корректный email",
    }),
    password: z.string().min(8, {
      message: "Пароль должен содержать минимум 8 символов",
    }),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Вы должны принять условия оферты",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })

const verificationFormSchema = z.object({
  code: z.string().length(6, {
    message: "Код должен содержать 6 цифр",
  }),
})

export default function RegisterPage() {
  const router = useRouter()
  const { register, verifyRegistration, isLoading, isAuthenticated } = useAuth()
  const [step, setStep] = useState<"register" | "verification">("register")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false) // Новое состояние для видимости пароля
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // Новое состояние для видимости подтверждения пароля

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  })

  const verificationForm = useForm<z.infer<typeof verificationFormSchema>>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      code: "",
    },
  })

  async function onRegisterSubmit(values: z.infer<typeof registerFormSchema>) {
    const result = await register(values.email, values.password)
    if (result.success) {
      setEmail(values.email)
      setStep("verification")
      toast({
        title: "Код отправлен",
        description: result.message || "Проверьте ваш email",
      })
    } else {
      toast({
        title: "Ошибка регистрации",
        description: result.message || "Не удалось зарегистрироваться",
        variant: "destructive",
      })
    }
  }

  async function onVerificationSubmit(values: z.infer<typeof verificationFormSchema>) {
    const result = await verifyRegistration(email, values.code)
    if (result.success) {
      toast({
        title: "Регистрация завершена",
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
  }

  const handleBackToRegister = () => {
    setStep("register")
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
          <p className="text-gray-600">{step === "register" ? "Создание аккаунта" : "Подтверждение регистрации"}</p>
        </div>

        <div className="minimal-card p-6">
          {step === "register" ? (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
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
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Пароль</FormLabel>
                      <div className="relative">
                        {" "}
                        {/* Обертка для кнопки глаза */}
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
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Подтверждение пароля</FormLabel>
                      <div className="relative">
                        {" "}
                        {/* Обертка для кнопки глаза */}
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            className="minimal-input h-10 pr-10"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-gray-600">
                          Согласен с{" "}
                          <Link href="/offer" className="text-black hover:underline">
                            условиями оферты
                          </Link>{" "}
                        </FormLabel>
                        <FormMessage />
                      </div>
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
                    "Зарегистрироваться"
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
                            if (value.length === 6 && !isLoading) {
                              setTimeout(() => {
                                verificationForm.handleSubmit(onVerificationSubmit)()
                              }, 100)
                            }
                          }}
                          disabled={isLoading}
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
                  disabled={isLoading || verificationForm.watch("code").length !== 6}
                >
                  {isLoading ? (
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
                    onClick={handleBackToRegister}
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
            {step === "register" ? (
              <>
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-black hover:underline font-medium">
                  Войти
                </Link>
              </>
            ) : (
              <>
                Вернуться к{" "}
                <Link href="/login" className="text-black hover:underline font-medium">
                  входу
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
