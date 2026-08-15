"use client"

import { useState } from "react"
import { deleteCategory as deleteCategoryAction } from "@/app/actions/admin/categories"
import { deleteFile } from "@/firebase/services/storage"
import { useStoreCategory } from "@/stores/common/category.store"
import { getAuthToken } from "@/lib/auth-token"
import { Category } from "@/types/db/db"

export const useCategoryDelete = (category: Category) => {
  const deleteStoreCategory = useStoreCategory(state => state.deleteCategory)
  const addCategory = useStoreCategory(state => state.addCategory)
  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState(false)
  const [error, setError] = useState("")

  const handlePopup = () => setPopup(current => !current)

  const handleDelete = async () => {
    setLoading(true)
    setError("")

    // Optimistic removal, restored below if the server rejects the write.
    deleteStoreCategory(category.id)

    try {
      const token = await getAuthToken()
      const result = await deleteCategoryAction(token, category.id)

      if (!result.ok) {
        throw new Error(result.error)
      }
    } catch {
      // Only a rejected document delete restores the row. `addCategory` re-sorts,
      // so it returns to its position.
      addCategory(category)
      setError("Ocurrió un error al borrar la categoría")
      setLoading(false)
      return
    }

    // The document is gone from here on, so a Storage failure must NOT restore
    // the row — that would show a category that no longer exists, and the error
    // would render into an already-unmounted row anyway. Unlike a banner, a
    // category image can be an empty string, and `deleteFile("")` rethrows, so
    // the call stays guarded. Worst case is an orphaned Storage object, which the
    // existing cleanup scripts handle.
    if (category.img.url) {
      try {
        await deleteFile(category.img.url)
      } catch (error) {
        console.error(`Orphaned Storage object for category ${category.id}`, error)
      }
    }

    setPopup(false)
    setLoading(false)
  }

  return { loading, popup, error, handlePopup, handleDelete }
}
