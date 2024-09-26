"use client"

import { FileInput } from "@/components/common/input"
import { LIMIT_FILES_SIZE } from "@/consts/admin/admin"
import { FileStateItem } from "@/types/admin/admin"
import { returnFileSize } from "@/utils/return-file-size"
import { Dispatch, InputHTMLAttributes, SetStateAction } from "react"
import { useUploadFile } from "@/hooks/common/use-upload-file"
import { ImagesContainer } from "./images-container"

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
  images: Array<File | FileStateItem>
  setImages: Dispatch<SetStateAction<Array<File | FileStateItem>>>
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
  images,
  setImages,
  ...props
}: Props) => {
  const { handleChange, totalSize, handleDeleteOld, handleDelete, error, handleDragEnd } = useUploadFile({
    items,
    limitSize,
    setItems,
    imgsOld,
    setImgsOld,
    multiple,
    refCollection,
    images,
    setImages
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
      <ImagesContainer
        className="mt-5"
        images={images}
        handleDragEnd={handleDragEnd}
        handleDelete={handleDelete}
        aspect={aspect}
        handleDeleteOld={handleDeleteOld}
      />
      <p
        className={`text-red-500 font-light text-sm ${classNameError}`}
      >{error}</p>
    </section>
  )
}