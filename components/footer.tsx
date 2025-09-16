import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">© 2025 SellZilla. Все права защищены.</div>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/offer" className="text-muted-foreground hover:text-foreground transition-colors">
              Публичная оферта
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
