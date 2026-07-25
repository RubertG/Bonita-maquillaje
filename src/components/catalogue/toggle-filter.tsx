"use client"

import { AnimatedCheckbox } from "@/components/common/animated-checkbox"
import { CatalogFilterType } from "@/hooks/catalog/use-catalog-filters"

interface Props {
  value: CatalogFilterType | null
  onChange: (value: CatalogFilterType | null) => void
  className?: string
}

const OPTIONS: { value: CatalogFilterType; label: string }[] = [
  { value: "mas-vendidos", label: "Más vendidos" },
  { value: "ofertas", label: "Ofertas" },
  { value: "nuevos", label: "Nuevos" }
]

export const ToggleFilter = ({ value, onChange, className }: Props) => {
  const handleToggle = (option: CatalogFilterType) => {
    onChange(value === option ? null : option)
  }

  return (
    <section className={className}>
      <h2 className="text-text-100 text-sm font-medium mb-3">Productos</h2>
      <div className="flex flex-col gap-3">
        {OPTIONS.map(option => (
          <AnimatedCheckbox
            key={option.value}
            id={`toggle-${option.value}`}
            label={option.label}
            checked={value === option.value}
            onChange={() => handleToggle(option.value)}
          />
        ))}
      </div>
    </section>
  )
}
