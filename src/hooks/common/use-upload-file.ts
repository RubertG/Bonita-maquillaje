"use client"

import { deleteFile } from "@/firebase/services/storage"
import { FileStateItem } from "@/types/admin/admin"
import { returnFileSize } from "@/utils/return-file-size"
import { ChangeEvent, useEffect, useState } from "react"

interface Props {
  limitSize: number
  items: File[]
  imgsOld?: FileStateItem[]
  setImgsOld?: (imgs: FileStateItem[]) => void
  setItems: (items: File[]) => void
  refCollection: string
  multiple: boolean
}

export const useUploadFile = ({
  items,
  limitSize,
  setItems,
  imgsOld,
  setImgsOld,
  multiple,
  refCollection
}: Props) => {
  const [error, setError] = useState("")
  const [totalSize, setTotalSize] = useState(0)

  useEffect(() => {
    setError("")
    if (imgsOld) {
      setTotalSize(totalSize + imgsOld.reduce((total, item) => total + item.size, 0))
    }
  }, [imgsOld])

  useEffect(() => {
    if (items.length === 0 && imgsOld && imgsOld.length === 0) {
      setTotalSize(0)
    }
  }, [items, imgsOld])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError("")

    if (event.target.files) {
      const files = Array.from(event.target.files)

      if (!multiple) {
        const file = files[0]

        if (!file) return

        if (file.size > limitSize) {
          setError(`El archivo pasa el límite de tamaño (${returnFileSize(limitSize)})`)
          return
        }

        if (imgsOld && imgsOld.length > 0) {
          setError("Borra la imagen anterior")
          return
        }

        setTotalSize(file.size)
        setItems([file])
        return
      }

      const newItems: File[] = []
      let filesSizes = items.reduce((total, item) => total + item.size, 0)

      for (const file of files) {
        filesSizes += file.size

        if (filesSizes > limitSize) {
          filesSizes -= file.size
          setError(`Se alcanzó el límite del tamaño de los archivos (${returnFileSize(limitSize)})`)
          continue
        }

        newItems.push(file)
      }

      if (imgsOld) {
        setTotalSize(filesSizes + imgsOld.reduce((total, item) => total + item.size, 0))
      } else {
        setTotalSize(filesSizes)
      }

      setItems([...items, ...newItems])
    }
  }

  const handleDelete = (item: File) => {
    setError("")
    setTotalSize(totalSize - items.find((it) => it.name === item.name)!.size)
    setItems(items.filter((it) => it.name !== item.name))
  }

  const handleDeleteOld = async (item: FileStateItem) => {
    setError("")
    setTotalSize((totalSize - item.size) < 0 ? 0 : (totalSize - item.size))
    await deleteFile(`${refCollection}/${item.name}`)

    if (setImgsOld && imgsOld) {
      setImgsOld(imgsOld.filter((it) => it.name !== item.name))
    }
  }

  return {
    handleChange,
    totalSize,
    handleDeleteOld,
    handleDelete,
    error
  }
}