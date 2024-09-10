"use client"

import { useProducts } from "@/hooks/admin/products/use-products"
import { ProductsContext } from "@/types/admin/admin"
import { createContext } from "react"

export const productsContext = createContext<ProductsContext>({
  products: [],
  refreshProducts: async () => { },
  loading: true,
  searchParams: {}
})

export const ProductsAdminProvider = ({ children }: { children: React.ReactNode }) => {
  const data = useProducts()

  return (
    <productsContext.Provider value={data}>
      {children}
    </productsContext.Provider>
  )
}