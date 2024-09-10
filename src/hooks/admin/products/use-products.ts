"use client"

import { getCategories } from "@/firebase/services/categories"
import { getProducts } from "@/firebase/services/products"
import { Product } from "@/types/db/db"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface ProductType { [key: string]: Product[] }

const pathNames = ["/admin/productos", "/catalogo"]

export const useProducts = () => {
  const [products, setProducts] = useState<ProductType>({})
  const [productsFilter, setProductsFilter] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const pathNameOriginal = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!pathNames.find((pn) => pathNameOriginal === pn)) return
    fetchProducts(searchParams.get("busqueda") || "", searchParams.get("categoria") || "")
  }, [searchParams])

  const filterProducts = (p: Product[], search: string) => {
    const newProducts = p.filter(product => {
      return product.name.toLocaleLowerCase().includes(search?.toLocaleLowerCase())
    })

    return newProducts
  }

  const fetchProducts = async (search?: string, category?: string) => {
    setLoading(true)
    let p: Product[] = []

    if (!category) {

      const [first] = await getCategories()
      const c = first.id
      p = await getProducts({ category: c })

      setProducts({
        ...products,
        [c]: p
      })
      const url = new URLSearchParams({
        ...(search && { busqueda: search }),
        categoria: c
      })

      router.replace(`${pathNameOriginal}?${url.toString()}`)
      setLoading(false)
      return
    }

    if (category && !products[category]) {
      p = await getProducts({ category: category })
      setProducts({
        ...products,
        [category]: p
      })
    } else {
      p = products[category]
    }

    setProductsFilter(filterProducts(p, search || ""))
    setLoading(false)
  }

  const refreshProducts = async (category: string) => {
    setLoading(true)
    const p: Product[] = await getProducts({ category })
    setProducts({
      ...products,
      [category]: p
    })
    setProductsFilter(p)
    setLoading(false)
  }

  return {
    products: productsFilter,
    refreshProducts,
    loading,
    searchParams: {
      busqueda: searchParams.get("busqueda"),
      categoria: searchParams.get("categoria")
    }
  }
}