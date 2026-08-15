import Link from "next/link"

interface AdminNavLinkProps {
  className?: string
}

export function AdminNavLink({ className }: AdminNavLinkProps) {
  return (
    <Link
      href="/admin"
      className={`group relative block py-2 px-3 lg:py-1 w-full border-b border-bg-200 lg:border-0 text-text-100 font-normal hover:text-principal-300 transition-colors duration-200 ${className ?? ""}`}
    >
      Administración
      <span className="hidden lg:block rounded-xl text-principal-300 absolute bottom-0 left-0 h-0.5 w-0 bg-current transition-all duration-300 group-hover:w-full" />
    </Link>
  )
}
