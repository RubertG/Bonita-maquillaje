"use client"

import type { CatalogFilters, CatalogFilterType, CatalogSort } from "@/hooks/catalog/use-catalog-filters"
import { useSearchParams } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react"

interface CatalogFiltersContextValue {
  filters: CatalogFilters
  setSearch: (search: string) => void
  setCategories: (categories: string[]) => void
  toggleCategory: (id: string) => void
  setType: (type: CatalogFilterType | null) => void
  setSort: (sort: CatalogSort | null) => void
  resetFilters: () => void
}

const FILTER_TYPES: CatalogFilterType[] = ["ofertas", "nuevos"]
const SORT_OPTIONS: CatalogSort[] = ["precio-asc", "precio-desc"]

const isFilterType = (value: string): value is CatalogFilterType =>
  FILTER_TYPES.includes(value as CatalogFilterType)

const isSort = (value: string): value is CatalogSort =>
  SORT_OPTIONS.includes(value as CatalogSort)

const EMPTY_FILTERS: CatalogFilters = {
  search: "",
  categories: [],
  type: null,
  sort: null
}

const parseFilters = (query: string): CatalogFilters => {
  const params = new URLSearchParams(query)
  const type = params.get("tipo")
  const sort = params.get("orden")

  return {
    search: params.get("busqueda") || "",
    categories: params.getAll("categoria").filter(Boolean),
    type: type && isFilterType(type) ? type : null,
    sort: sort && isSort(sort) ? sort : null
  }
}

const buildQuery = (filters: CatalogFilters): string => {
  const params = new URLSearchParams()

  filters.categories.forEach(id => {
    if (id) params.append("categoria", id)
  })

  if (filters.search) params.set("busqueda", filters.search)
  if (filters.type) params.set("tipo", filters.type)
  if (filters.sort) params.set("orden", filters.sort)

  return params.toString()
}

const URL_SYNC_DELAY = 300

const catalogFiltersContext = createContext<CatalogFiltersContextValue | undefined>(undefined)

export const CatalogFiltersProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<CatalogFilters>(() => parseFilters(searchParams.toString()))
  const lastQuery = useRef(searchParams.toString())

  // Inbound: the query string only seeds the state — on first load and whenever an
  // external navigation (nav links, category cards) brings different params. It is
  // never read back after an interaction, so typing cannot be overwritten.
  useEffect(() => {
    const query = searchParams.toString()
    if (query === lastQuery.current) return

    lastQuery.current = query
    setFilters(parseFilters(query))
  }, [searchParams])

  // Outbound: the URL mirrors the state so links stay shareable, written with the
  // history API instead of router.replace — no route re-render, no echo back into
  // the input. Debounced because the state already updated instantly.
  useEffect(() => {
    const query = buildQuery(filters)
    if (query === lastQuery.current) return

    const timeout = setTimeout(() => {
      lastQuery.current = query
      const { pathname } = window.location
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname)
    }, URL_SYNC_DELAY)

    return () => clearTimeout(timeout)
  }, [filters])

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }, [])

  const setCategories = useCallback((categories: string[]) => {
    setFilters(prev => ({ ...prev, categories }))
  }, [])

  const toggleCategory = useCallback((id: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter(category => category !== id)
        : [...prev.categories, id]
    }))
  }, [])

  const setType = useCallback((type: CatalogFilterType | null) => {
    setFilters(prev => ({ ...prev, type }))
  }, [])

  const setSort = useCallback((sort: CatalogSort | null) => {
    setFilters(prev => ({ ...prev, sort }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
  }, [])

  const value = useMemo(() => ({
    filters,
    setSearch,
    setCategories,
    toggleCategory,
    setType,
    setSort,
    resetFilters
  }), [filters, setSearch, setCategories, toggleCategory, setType, setSort, resetFilters])

  return (
    <catalogFiltersContext.Provider value={value}>
      {children}
    </catalogFiltersContext.Provider>
  )
}

export const useCatalogFiltersContext = () => {
  const context = useContext(catalogFiltersContext)
  if (context === undefined) {
    throw new Error("useCatalogFiltersContext must be used within a CatalogFiltersProvider")
  }
  return context
}
