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
      className={`block py-2 px-3 lg:py-1 w-full border-b border-bg-200 lg:border-0 text-text-100 font-normal hover:text-principal-300 hover:scale-105 transition-all duration-200 origin-left ${
        isActive ? "text-principal-300 border-b-2 border-principal-300" : ""
      } ${className ?? ""}`}
    >
      {category.name}
    </Link>
  )
}
