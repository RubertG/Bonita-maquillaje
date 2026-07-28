"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

export type CatalogFilterType = "ofertas" | "nuevos"
export type CatalogSort = "precio-asc" | "precio-desc"

export interface CatalogFilters {
  search: string
  categories: string[]
  type: CatalogFilterType | null
  sort: CatalogSort | null
}

const FILTER_TYPES: CatalogFilterType[] = ["ofertas", "nuevos"]
const SORT_OPTIONS: CatalogSort[] = ["precio-asc", "precio-desc"]

const isFilterType = (value: string): value is CatalogFilterType =>
  FILTER_TYPES.includes(value as CatalogFilterType)

const isSort = (value: string): value is CatalogSort =>
  SORT_OPTIONS.includes(value as CatalogSort)

export const useCatalogFilters = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo<CatalogFilters>(() => {
    const search = searchParams.get("busqueda") || ""
    const categories = searchParams.getAll("categoria")
    const typeParam = searchParams.get("tipo")
    const sortParam = searchParams.get("orden")

    return {
      search,
      categories,
      type: typeParam && isFilterType(typeParam) ? typeParam : null,
      sort: sortParam && isSort(sortParam) ? sortParam : null
    }
  }, [searchParams])

  const updateParams = useCallback((next: Partial<CatalogFilters>) => {
    const merged: CatalogFilters = { ...filters, ...next }
    const params = new URLSearchParams()

    merged.categories.forEach(id => {
      if (id) params.append("categoria", id)
    })

    if (merged.search) {
      params.set("busqueda", merged.search)
    }

    if (merged.type) {
      params.set("tipo", merged.type)
    }

    if (merged.sort) {
      params.set("orden", merged.sort)
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [filters, pathname, router])

  const setCategories = useCallback((categories: string[]) => {
    updateParams({ categories })
  }, [updateParams])

  const toggleCategory = useCallback((id: string) => {
    const categories = filters.categories.includes(id)
      ? filters.categories.filter(category => category !== id)
      : [...filters.categories, id]
    setCategories(categories)
  }, [filters.categories, setCategories])

  const setType = useCallback((type: CatalogFilterType | null) => {
    updateParams({ type })
  }, [updateParams])

  const setSort = useCallback((sort: CatalogSort | null) => {
    updateParams({ sort })
  }, [updateParams])

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [pathname, router])

  return {
    filters,
    toggleCategory,
    setType,
    setSort,
    resetFilters
  }
}
