"use client"

import { Product } from "@/types/admin/admin"
import { AddProductCard } from "./product-card"
import { Tone } from "@/types/db/db"

interface Props {
  className?: string
  searchedProducts: Product[]
  handleSelectProduct: (product: Product) => void
  changeCount: (product: Product, count: number) => void
  handleSelectTone: (product: Product, tone: Tone) => void
}

export const ProductsContainer = ({
  className, handleSelectProduct, searchedProducts, changeCount, handleSelectTone
}: Props) => {

  if (searchedProducts.length === 0) return null

  return (
    <ul className={`max-h-96 overflow-y-auto flex flex-col gap-3 md:gap-0 bg-bg-50 p-2 rounded-lg overflow-x-hidden shadow-button ${className}`}>
      {
        searchedProducts.map((product) => (
          <AddProductCard
            key={product.id}
            handleSelectTone={handleSelectTone}
            changeCount={changeCount}
            onClick={handleSelectProduct}
            product={product}
          />
        ))
      }
    </ul>
  )
}