import { Link } from "next-view-transitions"

interface AdminNavLinkProps {
  className?: string
}

export function AdminNavLink({ className }: AdminNavLinkProps) {
  return (
    <Link
      href="/admin"
      className={`block py-2 px-3 lg:py-1 w-full border-b border-bg-200 lg:border-0 lg:hover:bg-bg-300 lg:rounded-lg lg:transition-colors text-text-100 ${className ?? ""}`}
    >
      Administración
    </Link>
  )
}
