import { ProductRow, PRODUCT_ROW_LIMIT } from "@/components/catalogue/product-row"
import { getBestSellers } from "@/firebase/services/server/products"

interface Props {
  className?: string
}

export async function BestSellersSection({ className }: Props) {
  const products = (await getBestSellers()).slice(0, PRODUCT_ROW_LIMIT)

  if (products.length === 0) return null

  return (
    <ProductRow
      className={className}
      title="🔥 Los más vendidos"
      products={products}
      viewAllHref="/catalogo/productos?tipo=mas-vendidos"
    />
  )
}
