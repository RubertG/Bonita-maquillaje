"use client"

import { useRef, useState } from "react"
import { Searcher } from "@/components/common/searcher"
import { SlidersHorizontal } from "@/components/common/icons"
import { ProductsContainer } from "@/components/catalogue/products-container"
import { FilterSidebar } from "@/components/catalogue/filter-sidebar"
import { FilterDrawer } from "@/components/catalogue/filter-drawer"
import { useCatalogProductFilter } from "@/hooks/catalog/use-catalog-product-filter"

export const CatalogView = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const { count, total } = useCatalogProductFilter()

  return (
    <>
      <div className="sticky top-0 z-10 bg-bg-50 py-4 lg:static lg:py-0">
        <Searcher className="max-w-2xl mx-auto" />

        <section className="mt-4 flex items-center justify-between lg:hidden">
          <p className="text-sm text-text-300">
            {count} de {total} productos
          </p>
          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-bg-200 bg-bg-50 px-3 py-2 text-sm text-text-100 shadow-button"
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-text-100" />
            Filtros
          </button>
        </section>
      </div>

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        triggerRef={filterButtonRef}
      />

      <section className="mt-4 lg:mt-6 flex gap-6 items-start">
        <FilterSidebar />
        <ProductsContainer className="flex-1 min-w-0" />
      </section>
    </>
  )
}
