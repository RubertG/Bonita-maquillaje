"use client"

import { Product } from "./product"
import { ResetFilters } from "@/components/catalogue/reset-filters"
import { useAdminProductFilters } from "@/hooks/admin/products/use-admin-product-filters"
import { ProductSkeleton } from "./product-skeleton"

export const ProductsContainer = ({
  className
}: {
  className?: string
}) => {
  const { loading, filteredProducts, resetFilters } = useAdminProductFilters()

  return (
    <>
      {
        !loading && (
          <p className="text-text-300 font-light text-end mt-3">
            <span className="font-normal">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "Producto" : "Productos"}
          </p>
        )
      }
      <ul className={`${className} grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-2`}>
        {
          loading ? (
            Array(8).fill(0).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : (
            filteredProducts.map(product => (
              <Product
                key={product.id}
                {...product}
              />
            ))
          )
        }
      </ul>

      {
        ((filteredProducts.length === 0) && !loading) && (
          <section className={`${className} text-center text-text-300 mt-6`}>
            <p>No se encontraron productos con los filtros seleccionados.</p>
            <article className="mt-3 mx-auto">
              <ResetFilters
                onClick={resetFilters}
              />
            </article>
          </section>
        )
      }
    </>
  )
}