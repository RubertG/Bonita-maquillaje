"use client"

import { SelectInput } from "@/components/common/input"
import { getCategories } from "@/firebase/services/categories"
import { Category } from "@/types/db/db"
import { useEffect, useState } from "react"

export const SelectCategory = ({ className }: { className?: string }) => {
  const [items, setItems] = useState<Pick<Category , "name" | "id">[]>([])

  useEffect(() => {	
    const getC = async () => {
      const categories = await getCategories()
      if (!categories) return
      setItems(categories.map(category => ({
        name: category.name,
        id: category.id
      })))
    }
    getC()
  }, [])
  
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