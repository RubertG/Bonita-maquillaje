"use client"

import { FilterContent } from "./filter-content"

interface Props {
  className?: string
}

export const FilterSidebar = ({ className }: Props) => {
  return (
    <aside
      className={`hidden lg:block w-64 shrink-0 ${className}`}
    >
      <FilterContent />
    </aside>
  )
}
