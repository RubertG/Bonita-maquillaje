"use client"

import { CatalogProduct } from "@/types/server/catalog"
import { createContext, useContext, useMemo, useState, ReactNode } from "react"

interface CatalogProductsContextValue {
  products: CatalogProduct[]
  setProducts: (products: CatalogProduct[]) => void
}

const CatalogProductsContext = createContext<CatalogProductsContextValue>({
  products: [],
  setProducts: () => {}
})

export const CatalogProductsProvider = ({
  children,
  initialProducts = []
}: {
  children: ReactNode
  initialProducts?: CatalogProduct[]
}) => {
  const [products, setProducts] = useState(initialProducts)

  const value = useMemo(
    () => ({ products, setProducts }),
    [products]
  )

  return (
    <CatalogProductsContext.Provider value={value}>
      {children}
    </CatalogProductsContext.Provider>
  )
}

export const useCatalogProducts = () => useContext(CatalogProductsContext)
