import { ProductRow, PRODUCT_ROW_LIMIT } from "@/components/catalogue/product-row"
import { getNewArrivals } from "@/firebase/services/server/products"
import { CatalogProduct } from "@/types/server/catalog"

interface Props {
  className?: string
}

const byNewestFirst = (a: CatalogProduct, b: CatalogProduct) =>
  (b.createdAt ?? "").localeCompare(a.createdAt ?? "")

export async function NewArrivalsSection({ className }: Props) {
  const products = (await getNewArrivals()).toSorted(byNewestFirst).slice(0, PRODUCT_ROW_LIMIT)

  if (products.length === 0) return null

  return (
    <ProductRow
      className={className}
      title="⏰ Productos nuevos"
      products={products}
      viewAllHref="/catalogo/productos?tipo=nuevos"
      direction="right-to-left"
    />
  )
}
