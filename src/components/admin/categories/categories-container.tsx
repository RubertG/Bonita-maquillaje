"use client"

import { Delete } from "@/components/common/icons"
import Link from "next/link"
import { Category } from "@/components/common/category"
import { ScrollRow } from "@/components/common/scroll-row"
import { useStoreCategory } from "@/stores/common/category.store"
import { useEffect } from "react"
import { CategoriesSkeletonContainer } from "./categories-skeleton-container"

interface Props {
  className?: string
}

export const CategoriesContainer = ({ className }: Props) => {
  const categories = useStoreCategory(state => state.categories)
  const loading = useStoreCategory(state => state.loading)
  const fetchCategories = useStoreCategory(state => state.fetchCategories)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  if (loading) return <CategoriesSkeletonContainer className={className} />

  return (
    <ScrollRow
      className={className}
      wrapperTag="ul"
      slideTag="li"
      slideClassName="!w-auto"
      spaceBetween={8}
      centerWhenShort
    >
      {categories.map(category => (
        <Category {...category} key={category.id} />
      ))}
      {/* Same square footprint as Category so the row stays even. */}
      <Link
        className="p-2 rounded-lg lg:hover:bg-bg-200 transition-colors flex flex-col items-center justify-center gap-1 w-24 shrink-0 aspect-square overflow-hidden"
        href={`/admin/categorias`}
      >
        <Delete className="w-12 h-12 shrink-0 object-cover stroke-accent-300 stroke-1" />
        <h2
          className="text-xs leading-tight text-accent-300 text-center font-light line-clamp-2"
        >Quitar filtros</h2>
      </Link>
    </ScrollRow>
  )
}
