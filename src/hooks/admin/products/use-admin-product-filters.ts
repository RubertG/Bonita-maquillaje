"use client"

import { useProductsContext } from "@/hooks/admin/products/use-products-context"
import { Product } from "@/types/db/db"
import { useMemo, useState } from "react"

export type AdminQuickFilter = "all" | "discount" | "bestSeller" | "new"

export interface AdminProductFilters {
  quick: AdminQuickFilter
  categories: string[]
  search: string
}

const matchesQuick = (product: Product, quick: AdminQuickFilter): boolean => {
  if (quick === "discount") return product.offerPrice != null
  if (quick === "bestSeller") return product.isBestSeller === true
  if (quick === "new") return product.isNew === true
  return true
}

const matchesCategories = (product: Product, categories: string[]): boolean => {
  if (categories.length === 0) return true
  return categories.includes(product.category)
}

const matchesSearch = (product: Product, search: string): boolean => {
  if (!search) return true
  return product.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
}

export const useAdminProductFilters = () => {
  const { products, loading } = useProductsContext()
  const [filters, setFilters] = useState<AdminProductFilters>({
    quick: "all",
    categories: [],
    search: ""
  })

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      return matchesQuick(product, filters.quick)
        && matchesCategories(product, filters.categories)
        && matchesSearch(product, filters.search)
    })
  }, [products, filters])

  const setQuick = (quick: AdminQuickFilter) => {
    setFilters(prev => ({ ...prev, quick }))
  }

  const toggleCategory = (id: string) => {
    setFilters(prev => {
      const categories = prev.categories.includes(id)
        ? prev.categories.filter(category => category !== id)
        : [...prev.categories, id]
      return { ...prev, categories }
    })
  }

  const setSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }

  const resetFilters = () => {
    setFilters({
      quick: "all",
      categories: [],
      search: ""
    })
  }

  return {
    filters,
    setQuick,
    toggleCategory,
    setSearch,
    resetFilters,
    filteredProducts,
    loading
  }
}
