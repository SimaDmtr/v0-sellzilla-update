"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  enabled: z.boolean().default(false),
  responseType: z.enum(["auto", "fixed"]).default("auto"),
  fixedText: z.string().optional(),
  includeSignature: z.boolean().default(false),
  signature: z.string().optional(),
})

const defaultSignature = "Наш гарантийный отдел всегда на связи в «Чате с продавцом» или в Whаtsарр: +790123456789"

interface AutoResponseSettingsProps {
  initialValues?: {
    enabled: boolean
    responseType: "auto" | "fixed"
    fixedText: string
    includeSignature: boolean
    signature: string
  }
  onSave?: (values: {
    enabled: boolean
    responseType: "auto" | "fixed"
    fixedText: string
    includeSignature: boolean
    signature: string
  }) => void
}

export function AutoResponseSettings({ initialValues, onSave }: AutoResponseSettingsProps) {
  const [activeTab, setActiveTab] = useState("1")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      enabled: false,
      responseType: "auto",
      fixedText: "",
      includeSignature: false,
      signature: defaultSignature,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (onSave) {
      onSave(values)
    }

    toast({
      title: "Настройки сохранены",
      description: "Настройки автоответов успешно сохранены",
    })
  }

  const handleInsertTemplate = () => {
    const currentText = form.getValues("signature")
    if (currentText && currentText.trim() !== "") {
      if (confirm("Заменить текущую подпись шаблоном?")) {
        form.setValue("signature", defaultSignature)
      }
    } else {
      form.setValue("signature", defaultSignature)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="1">1 ★</TabsTrigger>
            <TabsTrigger value="2">2 ★</TabsTrigger>
            <TabsTrigger value="3">3 ★</TabsTrigger>
            <TabsTrigger value="4">4 ★</TabsTrigger>
            <TabsTrigger value="5">5 ★</TabsTrigger>
          </TabsList>

          {["1", "2", "3", "4", "5"].map((rating) => (
            <TabsContent key={rating} value={rating} className="space-y-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Автоответ для отзывов с {rating} ★</FormLabel>
                      <FormDescription>Автоматически отвечать на отзывы с данной оценкой</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("enabled") && (
                <>
                  <FormField
                    control={form.control}
                    name="responseType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Тип ответа</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-3 space-y-0">
                              <RadioGroupItem value="auto" id="auto" />
                              <FormLabel htmlFor="auto" className="font-normal">
                                Автоответ (GPT-4o-mini)
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-3 space-y-0">
                              <RadioGroupItem value="fixed" id="fixed" />
                              <FormLabel htmlFor="fixed" className="font-normal">
                                Фиксированный текст
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("responseType") === "fixed" && (
                    <FormField
                      control={form.control}
                      name="fixedText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Текст ответа</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Введите текст ответа на отзыв"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <FormField
          control={form.control}
          name="includeSignature"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Подпись</FormLabel>
                <FormDescription>Добавлять подпись ко всем автоответам</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("includeSignature") && (
          <FormField
            control={form.control}
            name="signature"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Текст подписи</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={handleInsertTemplate}>
                    Шаблон
                  </Button>
                </div>
                <FormControl>
                  <Textarea placeholder="Введите текст подписи" className="min-h-[80px]" {...field} />
                </FormControl>
                <FormDescription>
                  При сохранении цифры будут заменены на символы, а некоторые буквы изменены для обхода фильтров
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit">Сохранить настройки</Button>
      </form>
    </Form>
  )
}
