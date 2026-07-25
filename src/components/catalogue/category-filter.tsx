"use client"

import { Category } from "@/components/common/category"
import { CategoriesSkeletonContainer } from "@/components/catalogue/categories-container"
import { useStoreCategory } from "@/stores/common/category.store"
import { useEffect } from "react"

interface Props {
  selected: string[]
  onToggle: (id: string) => void
  className?: string
}

export const CategoryFilter = ({
  selected,
  onToggle,
  className
}: Props) => {
  const categories = useStoreCategory(state => state.categories)
  const loading = useStoreCategory(state => state.loading)
  const fetchCategories = useStoreCategory(state => state.fetchCategories)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <section className={className}>
      <h2 className="text-text-100 text-sm font-medium mb-3">Categorías</h2>
      <div className="flex flex-col gap-1">
        {
          categories.length > 0 && !loading && (
            categories.map(category => (
              <Category
                key={category.id}
                {...category}
                asButton
                variant="list"
                onClick={() => onToggle(category.id)}
                isActive={selected.includes(category.id)}
              />
            ))
          )
        }
        {
          loading && (
            <CategoriesSkeletonContainer />
          )
        }
      </div>
    </section>
  )
}
