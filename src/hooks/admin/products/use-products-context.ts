import { productsContext } from "@/contexts/admin/products/products-context"
import { useContext } from "react"

export const useProductsContext = () => {
  const context = useContext(productsContext)
  if (context === undefined) throw new Error('useProductsContext must be used within a ProductsProvider')
  return context
}