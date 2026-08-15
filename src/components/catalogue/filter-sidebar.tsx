"use client"

import { FilterContent } from "./filter-content"

interface Props {
  className?: string
}

export const FilterSidebar = ({ className }: Props) => {
  return (
    <aside
      className={`hidden lg:block w-64 shrink-0 self-start sticky top-20 ${className}`}
    >
      <FilterContent />
    </aside>
  )
}
