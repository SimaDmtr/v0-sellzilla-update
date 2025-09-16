export const dynamic = "force-static"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
        <a href="/" className="text-blue-600 hover:text-blue-800">
          Вернуться на главную
        </a>
      </div>
    </div>
  )
}
