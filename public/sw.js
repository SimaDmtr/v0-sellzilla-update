// Service Worker для push уведомлений
console.log("Service Worker загружен")

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker установлен")
  self.skipWaiting()
})

// Активация Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker активирован")
  event.waitUntil(self.clients.claim())
})

// Обработка push событий
self.addEventListener("push", (event) => {
  console.log("Получено push событие:", event)

  let notificationData = {
    title: "Новое уведомление",
    body: "У вас есть новые обновления",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    url: "/dashboard",
  }

  // Парсим данные из push события
  if (event.data) {
    try {
      const data = event.data.json()
      console.log("Данные push уведомления:", data)

      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        url: data.url || notificationData.url,
      }
    } catch (error) {
      console.error("Ошибка парсинга push данных:", error)
      // Используем данные по умолчанию
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url,
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Открыть",
        icon: "/favicon.ico",
      },
      {
        action: "close",
        title: "Закрыть",
      },
    ],
    requireInteraction: false,
    silent: false,
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, options))
})

// Обработка кликов по уведомлениям
self.addEventListener("notificationclick", (event) => {
  console.log("Клик по уведомлению:", event)

  event.notification.close()

  const urlToOpen = event.notification.data?.url || "/dashboard"

  if (event.action === "close") {
    // Просто закрываем уведомление
    return
  }

  // Открываем URL (по умолчанию или при действии "open")
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Ищем уже открытую вкладку с нашим сайтом
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          // Фокусируемся на существующей вкладке и переходим на нужную страницу
          return client.focus().then(() => {
            if ("navigate" in client) {
              return client.navigate(urlToOpen)
            }
          })
        }
      }

      // Если открытой вкладки нет, открываем новую
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    }),
  )
})

// Обработка закрытия уведомлений
self.addEventListener("notificationclose", (event) => {
  console.log("Уведомление закрыто:", event)
})

// Обработка ошибок push
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("Push подписка изменилась:", event)
  // Здесь можно реализовать логику обновления подписки на сервере
})

// Простой пинг для поддержания соединения
self.addEventListener("message", (event) => {
  if (event.data === "ping") {
    event.ports[0].postMessage("pong")
  }
})
