"use client"

import { getAllProducts } from "@/firebase/services/products"
import { Product } from "@/types/db/db"
import { ProductsContext } from "@/types/admin/admin"
import { createContext, useCallback, useEffect, useState } from "react"

export const productsContext = createContext<ProductsContext>({
  products: [],
  refreshProducts: async () => { },
  loading: true
})

export const ProductsAdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const refreshProducts = useCallback(async () => {
    setLoading(true)
    const allProducts = await getAllProducts()
    setProducts(allProducts)
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  return (
    <productsContext.Provider value={{ products, refreshProducts, loading }}>
      {children}
    </productsContext.Provider>
  )
}