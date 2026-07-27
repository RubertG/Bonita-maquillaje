const copFormatter = new Intl.NumberFormat("es-CO", {
  useGrouping: "always",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
})

export function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "$0"
  if (value < 0) return `-$${copFormatter.format(Math.abs(value))}`
  return `$${copFormatter.format(value)}`
}
