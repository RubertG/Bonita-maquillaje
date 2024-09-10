"use client"

import { getCategories } from "@/firebase/services/categories"
import { Category } from "@/components/common/category"
import { useEffect, useState } from "react"
import { Category as CategoryType } from "@/types/db/db"
import { CategoriesSkeletonContainer } from "../admin/categories/categories-skeleton-container"

interface Props {
  className?: string
}

export const CategoriesContainer = async ({ className }: Props) => {
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getC = async () => {
      setLoading(true)
      const categories = await getCategories()

      if (!categories) return

      setCategories(categories)
      setLoading(false)
    }

    getC()
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
    </section>
  )
}