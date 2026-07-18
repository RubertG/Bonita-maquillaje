"use client"

import { useSearchParams } from "next/navigation"
import { Category } from "@/types/db/db"
import Link from "next/link"

export type NavCategory = Pick<Category, "id" | "name">

interface NavCategoryLinkProps {
  category: NavCategory
  className?: string
  closeMenu?: () => void
}

export function NavCategoryLink({ category, className, closeMenu }: NavCategoryLinkProps) {
  const searchParams = useSearchParams()
  const activeId = searchParams?.get("categoria")
  const isActive = activeId === category.id
  const href = `/catalogo?categoria=${encodeURIComponent(category.id)}`

  return (
    <Link
      href={href}
      className={`group relative block py-2 px-3 lg:py-1 w-full border-b lg:border-0 text-text-100 font-normal hover:text-principal-300 transition-colors duration-200 ${
        isActive ? "text-principal-400 italic border-b-3 border-principal-300/50" : "border-principal-300/10"
      } ${className ?? ""}`}
      onClick={() => {
        if (closeMenu) {
          closeMenu()
        }
      }}
    >
      {category.name}
      <span className="hidden lg:block rounded-xl absolute bottom-0 left-0 h-0.5 w-0 bg-current transition-all duration-300 group-hover:w-full" />
    </Link>
  )
}
