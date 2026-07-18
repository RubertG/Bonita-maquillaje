"use client"

import { Link } from "next-view-transitions"
import { useSearchParams } from "next/navigation"
import { Category } from "@/types/db/db"

export type NavCategory = Pick<Category, "id" | "name">

interface NavCategoryLinkProps {
  category: NavCategory
  className?: string
}

export function NavCategoryLink({ category, className }: NavCategoryLinkProps) {
  const searchParams = useSearchParams()
  const activeId = searchParams?.get("categoria")
  const isActive = activeId === category.id
  const href = `/catalogo?categoria=${encodeURIComponent(category.id)}`

  return (
    <Link
      href={href}
      className={`block py-2 px-3 lg:py-1 w-full border-b border-bg-200 lg:border-0 lg:hover:bg-bg-300 lg:rounded-lg lg:transition-colors text-text-100 ${
        isActive ? "text-principal-300 border-b-2 border-principal-300" : ""
      } ${className ?? ""}`}
    >
      {category.name}
    </Link>
  )
}
