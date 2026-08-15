"use client"

import { AdminFilterContent } from "./admin-filter-content"

interface Props {
  className?: string
}

export const AdminFilterSidebar = ({ className }: Props) => {
  return (
    <aside
      className={`hidden lg:block w-64 shrink-0 self-start sticky top-20 ${className}`}
    >
      <AdminFilterContent />
    </aside>
  )
}
