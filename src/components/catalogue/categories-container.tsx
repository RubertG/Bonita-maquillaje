"use client"

import { Category } from "@/components/common/category"
import { CategorySkeleton } from "@/components/common/category-skeleton"
import { Category as CategoryType } from "@/types/db/db"
import { useSearchParams } from "next/navigation"

interface Props {
  className?: string
  initialCategories?: CategoryType[]
  baseHref?: string
  loading?: boolean
}

export const CategoriesContainer = ({
  className,
  initialCategories = [],
  baseHref,
  loading = false
}: Props) => {
  const searchParams = useSearchParams()
  const activeIds = searchParams.getAll("categoria")

  return (
    <section
      className={`${className} flex gap-2 items-center overflow-x-auto scrollbar-hide md:justify-center`}
    >
      {!loading &&
        initialCategories.length > 0 &&
        initialCategories.map(category => (
          <Category
            {...category}
            key={category.id}
            isActive={activeIds.includes(category.id)}
            href={baseHref ? `${baseHref}?categoria=${encodeURIComponent(category.id)}` : undefined}
          />
        ))}
      {!loading && initialCategories.length === 0 && (
        <p className="text-sm text-text-300">No hay categorías disponibles.</p>
      )}
      {loading && <CategoriesSkeletonContainer />}
    </section>
  )
}

export const CategoriesSkeletonContainer = ({ className, limit = 4 }: { className?: string, limit?: number }) => {
  return (
    <section className={`${className} flex gap-3 items-center overflow-x-auto scrollbar-hide md:justify-center`}>
      {Array(limit).fill(0).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </section>
  )
}
