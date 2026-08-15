"use client"

import { Delete } from "@/components/common/icons"
import { useState } from "react"
import { PopupDelete } from "../common/popup-delete"
import { useRouter } from "next/navigation"
import { deleteDiscountCode } from "@/app/actions/admin/discount-codes"
import { getAuthToken } from "@/lib/auth-token"

interface Props {
  code: string
}

export const OptionsDCCard = ({ code }: Props) => {
  const [popup, setPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    const token = await getAuthToken()
    const result = await deleteDiscountCode(token, code)
    if (!result.ok) {
      setLoading(false)
      setPopup(false)
      return
    }
    router.refresh()
    setLoading(false)
    setPopup(false)
  }

  const handlePopup = () => setPopup(!popup)

  return (
    <div>
      <button
        title="Eliminar código de descuento"
        onClick={handlePopup}
      >
        <Delete className="stroke-text-300 lg:hover:scale-110 lg:transition-transform" />
      </button>
      {
        popup && (
          <PopupDelete
            title="¿Deseas eliminar esta código?"
            handleDelete={handleDelete}
            loading={loading}
            handlePopup={handlePopup}
          />
        )
      }
    </div>
  )
}