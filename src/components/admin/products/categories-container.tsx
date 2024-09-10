"use client"

import { SquarePlus } from "@/components/common/icons"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Category as CategoryType } from "@/types/db/db"
import { Category } from "@/components/common/category"
import { getCategories } from "@/firebase/services/categories"
import { CategoriesSkeletonContainer } from "../categories/categories-skeleton-container"

interface Props {
  className?: string
}

export const CategoriesContainer = ({ className }: Props) => {
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
      {
        !loading && (
          <Link
            className="p-2 rounded-lg lg:hover:bg-bg-200 transition-colors"
            href={`/admin/categorias`}
          >
            <SquarePlus className="w-14 h-14 object-cover m-auto stroke-accent-300 mb-1" />
            <h2
              className="text-sm text-accent-300 text-center font-light"
            >Añadir</h2>
          </Link>
        )
      }
    </section>
  )
}