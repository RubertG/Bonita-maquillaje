import { Category } from "@/types/db/db"

// Categories without `order` sort after every ordered one. MAX_SAFE_INTEGER, not
// Infinity: `Infinity - Infinity` is NaN, which breaks the comparator when two
// categories both lack the field.
const MISSING_ORDER = Number.MAX_SAFE_INTEGER

const orderOf = (category: Category): number =>
  typeof category.order === "number" && Number.isFinite(category.order)
    ? category.order
    : MISSING_ORDER

// Returns a new array. Never mutates its input: the server `getCategories` is
// wrapped in React.cache and callers share that value within a request.
export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const byOrder = orderOf(a) - orderOf(b)
    if (byOrder !== 0) return byOrder

    const byName = a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    if (byName !== 0) return byName

    return a.id.localeCompare(b.id)
  })
}

// A new category is appended last. The seed is `length - 1`, NOT -1: do not
// "simplify" it. With -1, a category created while every other document is still
// unordered would get `order: 0`, which renders it FIRST (missing order sorts
// last) and collides with the 0 the backfill later assigns to
// `cajas-de-maquillaje`. Seeding at `length - 1` guarantees a value at or above
// the document count, so the new category lands after the canonical 0..n-1 the
// backfill writes, whether or not the backfill has run yet.
export function nextCategoryOrder(categories: Category[]): number {
  return categories.reduce((max, category) => {
    const order = orderOf(category)
    return order !== MISSING_ORDER && order > max ? order : max
  }, categories.length - 1) + 1
}
