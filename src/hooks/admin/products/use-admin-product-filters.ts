"use client"

import { useAdminFiltersContext } from "@/contexts/admin/products/admin-filters-context"
import { useProductsContext } from "@/hooks/admin/products/use-products-context"
import { Product } from "@/types/db/db"
import { useMemo } from "react"

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
  const { filters, setQuick, toggleCategory, setSearch, resetFilters } = useAdminFiltersContext()

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      return matchesQuick(product, filters.quick)
        && matchesCategories(product, filters.categories)
        && matchesSearch(product, filters.search)
    })
  }, [products, filters])

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
