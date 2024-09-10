"use client"

import { Delete } from "@/components/common/icons"
import { FileInput } from "@/components/common/input"
import { LIMIT_FILES_SIZE } from "@/consts/admin/admin"
import { FileStateItem } from "@/types/admin/admin"
import { returnFileSize } from "@/utils/return-file-size"
import { InputHTMLAttributes } from "react"
import { OldImg } from "./old-img"
import { useUploadFile } from "@/hooks/common/use-upload-file"

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  classNameError?: string
  limitSize?: number
  items: File[]
  aspect?: string
  imgsOld?: FileStateItem[]
  setImgsOld?: (imgs: FileStateItem[]) => void
  setItems: (items: File[]) => void
  refCollection?: string
  fixedSize?: number
}

export const UploadFile = ({
  className,
  classNameError = "mt-3",
  items,
  aspect = "3/4",
  limitSize = LIMIT_FILES_SIZE,
  setItems,
  imgsOld,
  setImgsOld,
  multiple = true,
  refCollection = "products",
  ...props
}: Props) => {
  const { handleChange, totalSize, handleDeleteOld, handleDelete, error } = useUploadFile({
    items,
    limitSize,
    setItems,
    imgsOld,
    setImgsOld,
    multiple,
    refCollection
  })

  return (
    <section className={`${className}`}>
      <p
        className="text-sm text-text-100 mb-3 font-light">
        Por recomendación y optimización, sube {multiple ? "las imágenes" : "la imagen"} en formato <span className="text-accent-300 font-medium">3/4</span> y que el peso {multiple ? "total de todas estas no superen" : "no supere"} los <span className="text-accent-300 font-medium">{returnFileSize(limitSize)}</span>.
      </p>
      <FileInput
        multiple={multiple}
        onChange={handleChange}
        {...props}
      />
      <p className="text-sm text-text-100 mt-3 font-light">
        El peso total cargado es de <span className="text-accent-300 font-medium">{returnFileSize(totalSize)}</span>
      </p>
      <ul className="grid gap-3 mt-5">
        {
          imgsOld?.map((item, index) => (
            <OldImg key={index} item={item} handleDeleteOld={handleDeleteOld} aspect={aspect} />
          ))
        }
        {
          items.map((item, index) => (
            <li
              className="flex w-full gap-2 items-center rounded-lg justify-between lg:transition-colors overflow-hidden"
              key={index}
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
                onClick={() => handleDelete(item)}
              >
                <Delete className="stroke-text-300 lg:hover:scale-110 lg:transition-transform" />
              </button>
            </li>
          ))
        }
      </ul>
      <p
        className={`text-red-500 font-light text-sm ${classNameError}`}
      >{error}</p>
    </section>
  )
}