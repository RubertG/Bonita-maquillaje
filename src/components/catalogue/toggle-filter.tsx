"use client"

import { AnimatedCheckbox } from "@/components/common/animated-checkbox"
import { CatalogFilterType } from "@/hooks/catalog/use-catalog-filters"

interface Props<T extends string> {
  value: T | null
  onChange: (value: T | null) => void
  className?: string
  title?: string
  options?: { value: T; label: string }[]
}

const DEFAULT_OPTIONS: { value: CatalogFilterType; label: string }[] = [
  { value: "ofertas", label: "Ofertas" },
  { value: "nuevos", label: "Nuevos" }
]

const DEFAULT_TITLE = "Productos"

export function ToggleFilter<T extends string>({
  value,
  onChange,
  className,
  title = DEFAULT_TITLE,
  options = DEFAULT_OPTIONS as { value: T; label: string }[]
}: Props<T>) {
  const handleToggle = (option: T) => {
    onChange(value === option ? null : option)
  }

  return (
    <section className={className}>
      <h2 className="text-text-100 text-sm font-medium mb-3">{title}</h2>
      <div className="flex flex-col gap-3">
        {options.map(option => (
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
