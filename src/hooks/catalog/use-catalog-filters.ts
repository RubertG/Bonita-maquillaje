"use client"

import { useCatalogFiltersContext } from "@/contexts/catalog/catalog-filters-context"

export type CatalogFilterType = "ofertas" | "nuevos"
export type CatalogSort = "precio-asc" | "precio-desc"

export interface CatalogFilters {
  search: string
  categories: string[]
  type: CatalogFilterType | null
  sort: CatalogSort | null
}

export const useCatalogFilters = () => useCatalogFiltersContext()
