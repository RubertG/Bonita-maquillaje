"use client"

import { BannerImage } from "@/types/admin/admin"
import { ImageDimensions, readImageDimensions } from "@/utils/read-image-dimensions"
import { useEffect, useState } from "react"

export const useBannerImage = () => {
  const [imgs, setImgs] = useState<File[]>([])
  const [imgOld, setImgOld] = useState<BannerImage[]>([])
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null)
  const [errorImgs, setErrorImgs] = useState("")

  useEffect(() => {
    if (imgs.length === 0) {
      setDimensions(null)
      return
    }

    let cancelled = false

    readImageDimensions(imgs[0])
      .then((result) => {
        if (cancelled) return
        setDimensions(result)
        setErrorImgs("")
      })
      .catch(() => {
        if (cancelled) return
        setDimensions(null)
        setErrorImgs("No se pudo leer el tamaño de la imagen. Prueba con otro archivo.")
      })

    return () => {
      cancelled = true
    }
  }, [imgs])

  const resolveDimensions = async (file: File): Promise<ImageDimensions> => {
    return dimensions ?? await readImageDimensions(file)
  }

  return {
    imgs,
    setImgs,
    imgOld,
    setImgOld,
    dimensions,
    resolveDimensions,
    errorImgs,
    setErrorImgs
  }
}
