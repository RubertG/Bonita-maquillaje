"use client"

import { SelectInput } from "@/components/common/input"
import { useStoreCategory } from "@/stores/common/category.store"
import { Category } from "@/types/db/db"
import { useEffect, useState } from "react"

export const SelectCategory = ({ className }: { className?: string }) => {
  const categories = useStoreCategory(state => state.categories)
  const fetchCategories = useStoreCategory(state => state.fetchCategories)
  const [items, setItems] = useState<Pick<Category , "name" | "id">[]>([])

  useEffect(() => {	
    const getC = async () => {

      if (categories.length === 0) {
        await fetchCategories()
      }

      setItems(categories.map(category => ({
        name: category.name,
        id: category.id
      })))
    }

    getC()
  }, [categories])
  
  return (
    <SelectInput
      className={className}
      title={items.length === 0 ? "Cargando categorías..." : "Selecciona la categoría"}
      items={items}
      id="category"
      name="category"
      placeholder="Categoría"
    />
  )
}