"use client"

import { Delete } from "@/components/common/icons"
import { returnFileSize } from "@/utils/return-file-size"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Props {
  item: File
  handleDelete: (item: File) => void
  aspect: string
}

export const ImgCard = ({
  item,
  handleDelete,
  aspect
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `${item.name}-${item.size}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

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
          src={URL.createObjectURL(item)} alt={`${item.name} - Bonita Maquillaje`}
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
        {...attributes}
        {...listeners}
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(item)
        }}
      >
        <Delete className="stroke-text-300 lg:hover:scale-110 lg:transition-transform" />
      </button>
    </li>
  )
}
