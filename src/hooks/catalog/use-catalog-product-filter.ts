"use client"

import { useMemo } from "react"
import { useCatalogProducts } from "@/contexts/catalog/catalog-products-context"
import { useCatalogFilters } from "./use-catalog-filters"

const normalize = (text: string) =>
  text.toLocaleLowerCase().trim()

export const useCatalogProductFilter = () => {
  const { products } = useCatalogProducts()
  const { filters } = useCatalogFilters()

  const filtered = useMemo(() => {
    let result = products

    if (filters.type) {
      result = result.filter(product => {
        if (filters.type === "mas-vendidos") return product.isBestSeller
        if (filters.type === "ofertas") return product.offerPrice !== null && product.offerPrice !== undefined && product.offerPrice < product.price
        if (filters.type === "nuevos") return product.isNew
        return true
      })
    }

    if (filters.categories.length > 0) {
      result = result.filter(product => filters.categories.includes(product.category))
    }

    if (filters.search) {
      const query = normalize(filters.search)
      result = result.filter(product => normalize(product.name).includes(query))
    }

    if (filters.sort) {
      result = [...result].sort((a, b) => {
        const aPrice = a.offerPrice ?? a.price
        const bPrice = b.offerPrice ?? b.price
        if (filters.sort === "precio-asc") return aPrice - bPrice
        return bPrice - aPrice
      })
    }

    return result
  }, [filters, products])

  return {
    products: filtered,
    loading: false,
    count: filtered.length,
    total: products.length
  }
}
