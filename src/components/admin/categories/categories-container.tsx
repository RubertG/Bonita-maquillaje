"use client"

import { Delete } from "@/components/common/icons"
import Link from "next/link"
import { Category } from "@/components/common/category"
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
  }, [])

  return (
    <section className={`${className} flex gap-2 items-center overflow-x-auto scrollbar-hide md:justify-center`}>
      {
        categories.length > 0 && !loading && (
          categories.map(category => (
            <Category {...category} key={category.id} />
          ))
        )
      }
      {
        loading && (
          <CategoriesSkeletonContainer />
        )
      }
      {
        !loading && (
          /* Same square footprint as Category so the row stays even. */
          <Link
            className="p-2 rounded-lg lg:hover:bg-bg-200 transition-colors flex flex-col items-center justify-center gap-1 w-24 shrink-0 aspect-square overflow-hidden"
            href={`/admin/categorias`}
          >
            <Delete className="w-12 h-12 shrink-0 object-cover stroke-accent-300 stroke-1" />
            <h2
              className="text-xs leading-tight text-accent-300 text-center font-light line-clamp-2"
            >Quitar filtros</h2>
          </Link>
        )
      }
    </section>
  )
}