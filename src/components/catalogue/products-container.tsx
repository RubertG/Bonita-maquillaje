"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { ButtonWithIcon } from "@/components/common/button-with-icon"
import { Delete } from "@/components/common/icons"
import { CatalogProduct } from "@/types/server/catalog"
import { ProductSkeleton } from "./product-skeleton"
import { ProductCard } from "./product-card"

interface Props {
  className?: string
  initialProducts?: CatalogProduct[]
}

export const ProductsContainer = ({
  className,
  initialProducts = []
}: Props) => {
  const searchParams = useSearchParams()
  const [products] = useState(initialProducts)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const category = searchParams?.get("categoria")
  const search = searchParams?.get("busqueda")

  const filteredProducts = useMemo(() => {
    let result = products

    if (category) {
      result = result.filter(product => product.category === category)
    }

    if (search) {
      const query = search.toLowerCase()
      result = result.filter(product => product.name.toLowerCase().includes(query))
    }

    return result
  }, [products, category, search])

  const hasActiveFilters = Boolean(category || search)
  const displayProducts = mounted ? filteredProducts : products

  return (
    <>
      <ul
        className={`${className} grid items-start grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-5 lg:gap-2`}
      >
        {displayProducts.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </ul>

      {displayProducts.length === 0 && (
        <section className={`${className} text-center text-text-300`}>
          <article className="mt-3 mx-auto">
            {hasActiveFilters && (
              <ButtonWithIcon href="/catalogo">
                <Delete className="stroke-text-100" />
                Quitar filtros
              </ButtonWithIcon>
            )}
          </article>
        </section>
      )}
    </>
  )
}