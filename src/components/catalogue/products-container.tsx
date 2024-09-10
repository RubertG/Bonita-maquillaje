"use client"

import { ButtonWithIcon } from "@/components/common/button-with-icon"
import { Delete } from "@/components/common/icons"
import { useProductsContext } from "@/hooks/admin/products/use-products-context"
import { ProductSkeleton } from "./product-skeleton"
import { ProductCard } from "./product-card"

export const ProductsContainer = ({
  className
}: {
  className?: string
}) => {
  const { loading, products, searchParams } = useProductsContext()

  return (
    <>
      <ul className={`${className} grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-5 lg:gap-2`}>
        {
          loading ? (
            Array(9).fill(0).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : (
            products.map(product => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))
          )
        }
      </ul>

      {
        ((!products || products.length === 0) && !loading) && (
          <section className={`${className} text-center text-text-300`}>
            <article className="mt-3 mx-auto">
              {
                (searchParams.busqueda) && (
                  <ButtonWithIcon
                    href={`/admin/productos?${new URLSearchParams({
                      categoria: searchParams.categoria || ""
                    }).toString()}`}>
                    <Delete className="stroke-text-100" />
                    Quitar filtros
                  </ButtonWithIcon>
                )
              }
            </article>
          </section>
        )
      }
    </>
  )
}