"use client"

import { Delete, Edit } from "@/components/common/icons"
import { useState } from "react"
import { PopupDelete } from "../common/popup-delete"
import { deleteOrder } from "@/firebase/services/orders"
import Link from "next/link"

interface Props {
  id: string
  setReload: (value: boolean) => void
}

export const OptionsOrderCard = ({ id, setReload }: Props) => {
  const [popup, setPopup] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await deleteOrder(id)
    setReload(true)
    setLoading(false)
    setPopup(false)
  }

  const handlePopup = () => setPopup(!popup)

  return (
    <div className="flex flex-col gap-2">
      <Link
        title="Editar pedido"
        href={`/admin/pedidos/editar-pedido/${id}`}
      >
        <Edit className="stroke-principal-200 lg:hover:scale-110 lg:transition-transform" />
      </Link>
      <button
        title="Eliminar pedido"
        onClick={handlePopup}
      >
        <Delete className="stroke-text-300 lg:hover:scale-110 lg:transition-transform" />
      </button>
      {
        popup && (
          <PopupDelete
            title="¿Deseas eliminar esta pedido?"
            handleDelete={handleDelete}
            loading={loading}
            handlePopup={handlePopup}
          />
        )
      }
    </div>
  )
}