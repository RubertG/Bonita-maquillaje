"use client"

import { Button } from "@/components/common/button"

interface Props {
  onClick: () => void
  className?: string
}

export const ResetFilters = ({ onClick, className }: Props) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={className}
      aria-label="Limpiar todos los filtros"
    >
      Limpiar filtros
    </Button>
  )
}
