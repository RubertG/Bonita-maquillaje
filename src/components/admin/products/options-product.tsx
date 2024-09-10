"use client"

import { Delete, Edit } from "@/components/common/icons"
import { deleteProduct } from "@/firebase/services/products"
import { deleteFile } from "@/firebase/services/storage"
import { Product } from "@/types/db/db"
import { useState } from "react"
import { PopupDelete } from "../common/popup-delete"
import Link from "next/link"
import { useProductsContext } from "@/hooks/admin/products/use-products-context"
import { useSearchParams } from "next/navigation"

export const OptionsProduct = ({ id, imgs }: Pick<Product, "id" | "imgs">) => {
  const [popup, setPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const { refreshProducts } = useProductsContext()

  const handleDelete = async () => {
    setLoading(true)
    await deleteProduct(id)
    await Promise.all(imgs.map(img => deleteFile(`products/${img.name}`)))
    refreshProducts(searchParams.get("categoria") || "")
    setLoading(false)
    setPopup(false)
  }

  const handlePopup = () => setPopup(!popup)

  return (
    <div className="flex flex-col gap-2">
      <Link
        title="Editar producto"
        href={`/admin/productos/editar-producto/${id}`}
      >
        <Edit className="stroke-principal-200 lg:hover:scale-110 lg:transition-transform" />
      </Link>
      <button
        title="Eliminar producto"
        onClick={handlePopup}
      >
        <Delete className="stroke-text-300 lg:hover:scale-110 lg:transition-transform" />
      </button>
      {
        popup && (
          <PopupDelete
            title="¿Deseas eliminar este producto?"
            handleDelete={handleDelete}
            loading={loading}
            handlePopup={handlePopup}
          />
        )
      }
    </div>
  )
}