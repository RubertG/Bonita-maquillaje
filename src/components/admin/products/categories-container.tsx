"use client"

import { SquarePlus } from "@/components/common/icons"
import Link from "next/link"
import { Category } from "@/components/common/category"
import { ScrollRow } from "@/components/common/scroll-row"
import { CategoriesSkeletonContainer } from "../categories/categories-skeleton-container"
import { useStoreCategory } from "@/stores/common/category.store"
import { useEffect } from "react"

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
      <Link
        className="p-2 rounded-lg lg:hover:bg-bg-200 transition-colors block"
        href={`/admin/categorias`}
      >
        <SquarePlus className="w-14 h-14 object-cover m-auto stroke-accent-300 mb-1" />
        <h2
          className="text-sm text-accent-300 text-center font-light"
        >Añadir</h2>
      </Link>
    </ScrollRow>
  )
}
