"use client"

import { AdminProductFilters, AdminQuickFilter } from "@/hooks/admin/products/use-admin-product-filters"
import { createContext, useCallback, useContext, useMemo, useState } from "react"

interface AdminFiltersContextValue {
  filters: AdminProductFilters
  setQuick: (quick: AdminQuickFilter | null) => void
  toggleCategory: (id: string) => void
  setSearch: (search: string) => void
  resetFilters: () => void
}

const adminFiltersContext = createContext<AdminFiltersContextValue | undefined>(undefined)

export const AdminFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<AdminProductFilters>({
    quick: null,
    categories: [],
    search: ""
  })

  const setQuick = useCallback((quick: AdminQuickFilter | null) => {
    setFilters(prev => ({ ...prev, quick }))
  }, [])

  const toggleCategory = useCallback((id: string) => {
    setFilters(prev => {
      const categories = prev.categories.includes(id)
        ? prev.categories.filter(category => category !== id)
        : [...prev.categories, id]
      return { ...prev, categories }
    })
  }, [])

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      quick: null,
      categories: [],
      search: ""
    })
  }, [])

  const value = useMemo(() => ({
    filters,
    setQuick,
    toggleCategory,
    setSearch,
    resetFilters
  }), [filters, setQuick, toggleCategory, setSearch, resetFilters])

  return (
    <adminFiltersContext.Provider value={value}>
      {children}
    </adminFiltersContext.Provider>
  )
}

export const useAdminFiltersContext = () => {
  const context = useContext(adminFiltersContext)
  if (context === undefined) {
    throw new Error("useAdminFiltersContext must be used within an AdminFiltersProvider")
  }
  return context
}
