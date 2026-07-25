"use client"

import { CatalogSort } from "@/hooks/catalog/use-catalog-filters"

interface Props {
  value: CatalogSort | null
  onChange: (value: CatalogSort | null) => void
  className?: string
}

export const SortSelect = ({ value, onChange, className }: Props) => {
  return (
    <section className={className}>
      <label htmlFor="sort-select" className="text-text-100 text-sm font-medium mb-3 block">
        Ordenar por
      </label>
      <select
        id="sort-select"
        value={value || ""}
        onChange={e => {
          const next = e.target.value
          onChange(next === "" ? null : (next as CatalogSort))
        }}
        className="w-full rounded-lg border border-bg-200 bg-bg-50 px-3 py-2.5 text-text-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-300"
      >
        <option value="">Relevancia</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
      </select>
    </section>
  )
}
