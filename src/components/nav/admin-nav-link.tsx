import { Link } from "next-view-transitions"

interface AdminNavLinkProps {
  className?: string
}

export function AdminNavLink({ className }: AdminNavLinkProps) {
  return (
    <Link
      href="/admin"
      className={`block py-2 px-3 lg:py-1 w-full border-b border-bg-200 lg:border-0 text-text-100 font-normal hover:text-principal-300 hover:scale-105 transition-all duration-200 origin-left ${className ?? ""}`}
    >
      Administración
    </Link>
  )
}
