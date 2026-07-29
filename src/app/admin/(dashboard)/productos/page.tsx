"use client"

import { Suspense } from "react"
import { AdminFiltersProvider } from "@/contexts/admin/products/admin-filters-context"
import { AdminFilterSidebar } from "@/components/admin/products/admin-filter-sidebar"
import { ProductsContainer } from "@/components/admin/products/products-container"
import { ProductSkeleton } from "@/components/admin/products/product-skeleton"
import { ButtonWithIcon } from "@/components/common/button-with-icon"
import { H1 } from "@/components/common/h1"
import { Store } from "@/components/common/icons"

function ProductsSkeletonGrid() {
  return (
    <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-2">
      {Array(8).fill(0).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </ul>
  )
}

function ProductsPage() {
  return (
    <main className="px-4 my-20 xl:px-0 max-w-6xl mx-auto">
      <H1 className="mb-6">Productos</H1>
      <AdminFiltersProvider>
        <section className="flex flex-col lg:flex-row gap-6 items-start">
          <AdminFilterSidebar />
          <div className="flex-1 min-w-0 w-full">
            <section className="flex justify-end mb-6">
              <ButtonWithIcon
                className="w-full sm:w-auto whitespace-nowrap"
                href="/admin/productos/crear-producto">
                <Store className="absolute top-1/2 -translate-y-1/2 left-0 ml-3.5 sm:relative sm:top-0 sm:translate-y-0 sm:ml-0 stroke-text-100 w-6" />
                Añadir producto
              </ButtonWithIcon>
            </section>
            <Suspense fallback={<ProductsSkeletonGrid />}>
              <ProductsContainer className="mt-6" />
            </Suspense>
          </div>
        </section>
      </AdminFiltersProvider>
    </main>
  )
}

export default ProductsPage