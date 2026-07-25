"use client"

import { useCatalogProductFilter } from "@/hooks/catalog/use-catalog-product-filter"
import { ProductCard } from "./product-card"

export const ProductsContainer = ({
  className
}: {
  className?: string
}) => {
  const { products, count } = useCatalogProductFilter()

  return (
    <section className={className}>
      <ul className="grid items-start grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-5 lg:gap-2">
        {products.map((product, index) => (
          <li key={product.id} className="list-none">
            <ProductCard {...product} priority={index < 5} />
          </li>
        ))}
      </ul>

      {count === 0 && (
        <p className="text-center text-text-300 mt-6">
          No se encontraron productos con los filtros seleccionados.
        </p>
      )}
    </section>
  )
}
