"use client"

import { useCatalogFilters } from "@/hooks/catalog/use-catalog-filters"
import { CategoryFilter } from "./category-filter"
import { ToggleFilter } from "./toggle-filter"
import { SortSelect } from "./sort-select"
import { ResetFilters } from "./reset-filters"

interface Props {
  className?: string
  onClose?: () => void
}

export const FilterContent = ({ className, onClose }: Props) => {
  const { filters, toggleCategory, setType, setSort, resetFilters } = useCatalogFilters()

  const handleReset = () => {
    resetFilters()
    onClose?.()
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <CategoryFilter
        selected={filters.categories}
        onToggle={toggleCategory}
      />
      <ToggleFilter
        value={filters.type}
        onChange={setType}
      />
      <SortSelect
        value={filters.sort}
        onChange={setSort}
      />
      <ResetFilters
        onClick={handleReset}
      />
    </div>
  )
}
