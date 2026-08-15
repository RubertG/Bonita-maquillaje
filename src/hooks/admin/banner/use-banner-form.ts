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
    imgs: imgsMobile, setImgs: setImgsMobile, imgOld: imgOldMobile,
    setImgOld: setImgOldMobile, resolveDimensions: resolveDimensionsMobile,
    errorImgs: errorImgsMobile, setErrorImgs: setErrorImgsMobile
  } = useBannerImage()

  const {
    imgs: imgsDesktop, setImgs: setImgsDesktop, imgOld: imgOldDesktop,
    setImgOld: setImgOldDesktop, resolveDimensions: resolveDimensionsDesktop,
    errorImgs: errorImgsDesktop, setErrorImgs: setErrorImgsDesktop
  } = useBannerImage()

  const { banners, addBanner, deleteBanner: deleteStoreBanner } = useBannerAdmin()

  const { errors, handleSubmit, loading, register, reset } = useForm<BannerInputs>({
    schema: bannerSchema,
    values: EMPTY_VALUES,
    actionSubmit: async (data) => {
      setError("")
      setErrorImgsMobile("")
      setErrorImgsDesktop("")

      if (imgsMobile.length === 0) {
        setErrorImgsMobile("Se requiere cargar una imagen")
        return
      }

      const bannerId = uuidv4()
      let mobileDimensions

      try {
        mobileDimensions = await resolveDimensionsMobile(imgsMobile[0])
      } catch {
        setErrorImgsMobile("No se pudo leer el tamaño de la imagen. Prueba con otro archivo.")
        return
      }

      let desktopDimensions
      if (imgsDesktop.length > 0) {
        try {
          desktopDimensions = await resolveDimensionsDesktop(imgsDesktop[0])
        } catch {
          setErrorImgsDesktop("No se pudo leer el tamaño de la imagen. Prueba con otro archivo.")
          return
        }
      }

      let banner: Banner | undefined

      try {
        const { url, name } = await saveFile(imgsMobile[0], bannerId, "/banners")

        banner = {
          id: bannerId,
          alt: data.alt,
          img: { name, url, size: imgsMobile[0].size, width: mobileDimensions.width, height: mobileDimensions.height },
          order: banners.length,
          active: true
        }

        if (imgsDesktop.length > 0 && desktopDimensions) {
          const { url: urlDesktop, name: nameDesktop } = await saveFile(imgsDesktop[0], bannerId, "/banners")
          banner.imgDesktop = {
            name: nameDesktop,
            url: urlDesktop,
            size: imgsDesktop[0].size,
            width: desktopDimensions.width,
            height: desktopDimensions.height
          }
        }

        addBanner(banner)

        const token = await getAuthToken()
        const result = await createBanner(token, banner)

        if (!result.ok) {
          throw new Error(result.error)
        }

        setImgsMobile([])
        setImgOldMobile([])
        setErrorImgsMobile("")
        setImgsDesktop([])
        setImgOldDesktop([])
        setErrorImgsDesktop("")
        reset(EMPTY_VALUES)
      } catch {
        if (banner) deleteStoreBanner(banner.id)
        setError("Ocurrió un error al guardar el banner")
      }
    }
  })

  const onSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()

    if (imgsMobile.length === 0) {
      setErrorImgsMobile("Se requiere cargar una imagen")
    }

    await handleSubmit(e)
  }

  return {
    error,
    errorImgsMobile,
    errorImgsDesktop,
    errors,
    imgsMobile,
    imgsDesktop,
    imgOldMobile,
    imgOldDesktop,
    loading,
    onSubmit,
    register,
    setImgsMobile,
    setImgsDesktop,
    setImgOldMobile,
    setImgOldDesktop
  }
}
