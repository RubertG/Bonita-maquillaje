"use client"

import { Category } from "@/components/common/category"
import { CategoriesSkeletonContainer } from "../admin/categories/categories-skeleton-container"
import { Category as CategoryType } from "@/types/db/db"

interface Props {
  className?: string
  initialCategories?: CategoryType[]
}

export const CategoriesContainer = ({
  className,
  initialCategories = []
}: Props) => {
  const loading = initialCategories.length === 0

  return (
    <section
      className={`${className} flex gap-2 items-center overflow-x-auto scrollbar-hide md:justify-center`}
    >
      {!loading &&
        initialCategories.map(category => (
          <Category {...category} key={category.id} />
        ))}
      {loading && <CategoriesSkeletonContainer />}
    </section>
  )
}
