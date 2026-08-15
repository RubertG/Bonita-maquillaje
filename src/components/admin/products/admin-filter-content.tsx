"use client"

import { ToggleFilter } from "@/components/catalogue/toggle-filter"
import { CategoryFilter } from "@/components/catalogue/category-filter"
import { ResetFilters } from "@/components/catalogue/reset-filters"
import { useAdminProductFilters } from "@/hooks/admin/products/use-admin-product-filters"

interface Props {
  className?: string
}

const QUICK_OPTIONS = [
  { value: "discount" as const, label: "Con descuento" },
  { value: "bestSeller" as const, label: "Más vendidos" },
  { value: "new" as const, label: "Nuevos" }
]

export const AdminFilterContent = ({ className }: Props) => {
  const { filters, setQuick, toggleCategory, resetFilters } = useAdminProductFilters()

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <ToggleFilter
        title="Productos"
        value={filters.quick}
        onChange={setQuick}
        options={QUICK_OPTIONS}
      />
      <CategoryFilter
        selected={filters.categories}
        onToggle={toggleCategory}
        publicOnly={false}
      />
      <ResetFilters
        onClick={resetFilters}
      />
    </div>
  )
}
