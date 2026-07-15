"use client"

import { getAllProducts } from "@/firebase/services/products"
import { Product } from "@/types/admin/admin"
import { Tone } from "@/types/db/db"
import { useCallback, useEffect, useState } from "react"

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
}

export const useProductsForm = ({
  products, searchedProducts,
  setProducts, setSearchedProducts
}: Props) => {
  const [search, setSearch] = useState<string | undefined>()

  const getP = useCallback(async () => {
    const p = await getAllProducts(search || "")
    const parseProducts: Product[] = p.map((p) => ({
      ...p,
      amount: 0
    }))
    setSearchedProducts({
      original: parseProducts,
      filtered: search ? parseProducts : []
    })
  }, [search, setSearchedProducts])

  useEffect(() => {
    if (search && search !== "") {
      setSearchedProducts((prev) => {
        if (prev.original.length === 0) {
          getP()
          return prev
        }

        const originalAux = JSON.parse(JSON.stringify(prev.original)) as Product[]
        return {
          original: prev.original,
          filtered: originalAux.filter((product) => {
            return product.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
          })
        }
      })
      return
    }

    setSearchedProducts((prev) => {
      if (prev.original.length === 0) {
        getP()
        return prev
      }

      if (prev.filtered.length !== 0 && !search) {
        return {
          original: prev.original,
          filtered: []
        }
      }

      return {
        original: prev.original,
        filtered: JSON.parse(JSON.stringify(prev.original)) as Product[]
      }
    })
  }, [getP, search, setSearchedProducts])

  useEffect(() => {
    setSearch("")
  }, [products])

  const handleSelectProduct = (product: Product) => {
    setProducts([...products, product])
    setSearchedProducts({
      ...searchedProducts,
      filtered: []
    })
  }

  const handleDeleteProduct = (product: Product) => {
    setProducts(products.filter((p) => {
      if (product.id === product.id && product.tone && p.tone) {
        return p.tone !== product.tone
      }

      return p.id !== product.id
    }))
    setSearchedProducts({
      ...searchedProducts,
      filtered: []
    })
  }

  const handleChangeCountFilters = (product: Product, count: number) => {
    const newProducts = searchedProducts.filtered.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          amount: count
        }
      }
      return p
    })
    setSearchedProducts({
      ...searchedProducts,
      filtered: newProducts
    })
  }

  const handleSelectTone = (product: Product, tone: Tone) => {
    const newProducts = searchedProducts.filtered.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          tone: tone
        }
      }
      return p
    })
    setSearchedProducts({
      ...searchedProducts,
      filtered: newProducts
    })
  }

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
  }

  return {
    search,
    setSearch,
    handleSelectProduct,
    handleDeleteProduct,
    handleChangeCountFilters,
    handleSelectTone,
    handleChangeCount
  }
}