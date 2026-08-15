import { ProductRow, PRODUCT_ROW_LIMIT } from "@/components/catalogue/product-row"
import { getOnOffer } from "@/firebase/services/server/products"

interface Props {
  className?: string
}

export async function OffersSection({ className }: Props) {
  const products = (await getOnOffer()).slice(0, PRODUCT_ROW_LIMIT)

  if (products.length === 0) return null

  return (
    <ProductRow
      className={className}
      title="💸 En oferta"
      products={products}
      viewAllHref="/catalogo/productos?tipo=ofertas"
      eagerImages={3}
      direction="right-to-left"
    />
  )
}
