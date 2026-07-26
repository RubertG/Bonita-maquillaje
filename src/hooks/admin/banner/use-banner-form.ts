"use client"

import { BaseSyntheticEvent, useState } from "react"
import { useForm } from "../../common/use-form"
import { bannerSchema } from "@/validations/admin/banners/banner"
import { saveFile } from "@/firebase/services/storage"
import { v4 as uuidv4 } from "uuid"
import { createBanner } from "@/app/actions/admin/banners"
import { getAuthToken } from "@/lib/auth-token"
import { BannerInputs } from "@/types/admin/admin"
import { Banner } from "@/types/db/db"
import { useBannerAdmin } from "@/contexts/admin/banners/banners-context"
import { useBannerImage } from "./use-banner-image"

const EMPTY_VALUES: BannerInputs = { alt: "" }

export const useBannerForm = () => {
  const [error, setError] = useState("")

  const {
    imgs, setImgs, imgOld, setImgOld,
    resolveDimensions, errorImgs, setErrorImgs
  } = useBannerImage()

  const { banners, addBanner, deleteBanner: deleteStoreBanner } = useBannerAdmin()

  const { errors, handleSubmit, loading, register, reset } = useForm<BannerInputs>({
    schema: bannerSchema,
    values: EMPTY_VALUES,
    actionSubmit: async (data) => {
      setError("")

      if (imgs.length === 0) {
        setErrorImgs("Se requiere cargar una imagen")
        return
      }

      const bannerId = uuidv4()
      let dimensions

      // Dimensions are read before the upload so an undecodable file never costs
      // a Storage write.
      try {
        dimensions = await resolveDimensions(imgs[0])
      } catch {
        setErrorImgs("No se pudo leer el tamaño de la imagen. Prueba con otro archivo.")
        return
      }

      let banner: Banner | undefined

      try {
        const { url, name } = await saveFile(imgs[0], bannerId, "/banners")

        banner = {
          id: bannerId,
          alt: data.alt,
          img: { name, url, size: imgs[0].size, width: dimensions.width, height: dimensions.height },
          order: banners.length,
          active: true
        }

        addBanner(banner)

        const token = await getAuthToken()
        const result = await createBanner(token, banner)

        if (!result.ok) {
          throw new Error(result.error)
        }

        setImgs([])
        setImgOld([])
        setErrorImgs("")
        reset(EMPTY_VALUES)
      } catch {
        if (banner) deleteStoreBanner(banner.id)
        setError("Ocurrió un error al guardar el banner")
      }
    }
  })

  const onSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()

    if (imgs.length === 0) {
      setErrorImgs("Se requiere cargar una imagen")
    }

    await handleSubmit(e)
  }

  return {
    error,
    errorImgs,
    errors,
    imgs,
    imgOld,
    loading,
    onSubmit,
    register,
    setImgs,
    setImgOld
  }
}
