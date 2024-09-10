"use client"

import { Product } from "@/types/admin/admin"
import { ProductsContainer } from "./products-container"
import { DeleteProductCard } from "./product-card"
import clsx from "clsx"
import { ProductsSummary } from "../../common/products-summary"
import { SearcherClient } from "@/components/common/searcher"
import { useProductsForm } from "@/hooks/admin/orders/use-products-form"

interface Props {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  setSearchedProducts: React.Dispatch<React.SetStateAction<{
    original: Product[]
    filtered: Product[]
  }>>
  searchedProducts: {
    original: Product[]
    filtered: Product[]
  }
  className?: string
}

export const ProductsForm = ({
  products,
  setProducts,
  setSearchedProducts,
  searchedProducts,
  className
}: Props) => {
  const {
    handleChangeCount, handleChangeCountFilters,
    handleDeleteProduct, handleSelectProduct,
    handleSelectTone, search, setSearch
  } = useProductsForm({
    products, searchedProducts,
    setProducts, setSearchedProducts
  })

  return (
    <>
      <SearcherClient
        search={search || ""}
        setSearch={setSearch}
        placeholder="Buscar producto a agregar..."
      />
      <section className={`relative ${className}`}>
        {
          search && (
            <ProductsContainer
              className={clsx(`absolute w-full top-0 left-0 z-30 ${className}`, {
                "mt-4": products.length === 0,
                "": products.length !== 0
              })}
              handleSelectTone={handleSelectTone}
              changeCount={handleChangeCountFilters}
              searchedProducts={searchedProducts.filtered}
              handleSelectProduct={handleSelectProduct} />
          )
        }
        {
          products.length > 0 && (
            <ul className="flex flex-col gap-3 mt-4">
              {
                products.map((product) => (
                  <DeleteProductCard
                    key={product.id}
                    changeCount={handleChangeCount}
                    onClick={handleDeleteProduct}
                    product={product}
                  />
                ))
              }
            </ul>
          )
        }
        {
          products.length > 0 && (
            <ProductsSummary
              className="mt-4"
              products={products} />
          )
        }
      </section>
    </>
  )
}