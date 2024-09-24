"use client"

import { Delete } from "@/components/common/icons"
import { FileStateItem } from "@/types/admin/admin"
import { returnFileSize } from "@/utils/return-file-size"
import { useState } from "react"
import { PopupDelete } from "./popup-delete"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
export const OldImg = ({
  item,
  handleDeleteOld,
  aspect
}: {
  item: FileStateItem
  handleDeleteOld: (item: FileStateItem) => Promise<void>
  aspect: string
}) => {
  const [popup, setPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `${item.name}-${item.size}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  const handlePopup = () => setPopup(!popup)

  return (
    <li
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="flex w-full gap-2 items-center rounded-lg justify-between lg:transition-colors overflow-hidden cursor-grab"
    >
      <div className="flex gap-2 items-center justify-between overflow-hidden">
        <img
          style={{ aspectRatio: aspect }}
          className="w-16 object-cover rounded-lg"
          loading="lazy"
          src={item.url} alt={`${item.name} - Bonita Maquillaje`}
          title={`${item.name} - Bonita Maquillaje`} />
        <div className="w-full overflow-hidden">
          <p className="font-light text-text-200 whitespace-nowrap overflow-hidden text-ellipsis"
            title={item.name}
          >
            {item.name}
          </p>
          <p className="font-light text-sm text-text-200">
            {returnFileSize(item.size)}
          </p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handlePopup()
        }}
      >
        <Delete className="stroke-text-300 lg:hover:scale-110 lg:transition-transform" />
      </button>
      {
        popup &&
        <PopupDelete
          title="¿Deseas eliminar esta imagen?"
          handleDelete={async (e) => {
            e.stopPropagation()
            setLoading(true)
            await handleDeleteOld(item)
            setLoading(false)
            setPopup(false)
          }}
          handlePopup={handlePopup}
          loading={loading}
        />
      }
    </li>
  )
}