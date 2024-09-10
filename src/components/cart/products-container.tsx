"use client"

import { DeleteProductCard } from "../admin/orders/product-card"
import { Product } from "@/types/admin/admin"
import Skeleton from "react-loading-skeleton"
import { Delete } from "../common/icons"
import { changeCount, removeCart } from "@/utils/cart"

interface Props {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  loading: boolean
  skeletons?: number
}

export const ProductsContainer = ({
  products,
  setProducts,
  loading,
  skeletons = 2
}: Props) => {
  const handleChangeCount = (product: Product, count: number) => {
    const newProducts = products.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          amount: count
        }
      }
      return p
    })
    setProducts(newProducts)
    changeCount(product.id, count)
  }

  const handleDeleteProduct = (product: Product) => {
    setProducts(products.filter((p) => {
      if (product.id === product.id && product.tone && p.tone) {
        return p.tone !== product.tone
      }

      return p.id !== product.id
    }))
    removeCart(product)
  }

  return (
    <ul className="flex flex-col gap-3">
      {
        loading ? (
          <>
            {
              Array(skeletons).fill(0).map((_, index) => (
                <li
                  key={index}
                  className="grid grid-cols-[1fr_auto] gap-2 items-center rounded-lg lg:p-2 entry"
                >
                  <div className="grid grid-cols-[64px_1fr] gap-2 items-center justify-between overflow-hidden">
                    <Skeleton
                      className="w-16 aspect-[3/4]" />
                    <div className="grid">
                      <Skeleton className="text-lg text-text-100 w-14" />
                      <Skeleton className="text-lg w-14" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      disabled
                    >
                      <Delete className="w-5 h-5 stroke-text-200 lg:hover:scale-125 lg:transition-transform" />
                    </button>
                  </div>
                </li>
              ))
            }
          </>
        ) : (
          products.map((product) => (
            <DeleteProductCard
              key={product.id + product.tone?.name}
              changeCount={handleChangeCount}
              onClick={handleDeleteProduct}
              product={product}
            />
          ))
        )
      }
    </ul>
  )
}