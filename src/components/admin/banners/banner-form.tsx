"use client"

import { UploadFile } from "../common/upload-file"
import { LIMIT_BANNER_FILE_SIZE } from "@/consts/admin/admin"
import { Button } from "@/components/common/button"
import { Save, Spinner } from "@/components/common/icons"
import clsx from "clsx"
import { useBannerForm } from "@/hooks/admin/banner/use-banner-form"
import { Dispatch, SetStateAction, useMemo } from "react"
import { FileStateItem } from "@/types/admin/admin"

interface Props {
  className?: string
}

export const BannerForm = ({ className }: Props) => {
  const {
    error, errorImgsDesktop, errorImgsMobile, errors,
    imgsDesktop, imgsMobile, loading, onSubmit,
    register, setImgsDesktop, setImgsMobile, imgOldDesktop,
    imgOldMobile, setImgOldDesktop, setImgOldMobile
  } = useBannerForm()

  const imageFields = useMemo(() => [
    {
      key: "mobile",
      label: "Imagen para móvil",
      aspect: "17/9",
      imgs: imgsMobile,
      setImgs: setImgsMobile,
      imgsOld: imgOldMobile,
      setImgsOld: setImgOldMobile,
      error: errorImgsMobile
    },
    {
      key: "desktop",
      label: "Imagen para escritorio",
      aspect: "28/9",
      imgs: imgsDesktop,
      setImgs: setImgsDesktop,
      imgsOld: imgOldDesktop,
      setImgsOld: setImgOldDesktop,
      error: errorImgsDesktop
    }
  ], [imgsMobile, imgsDesktop, imgOldMobile, imgOldDesktop, errorImgsMobile, errorImgsDesktop, setImgsMobile, setImgsDesktop, setImgOldMobile, setImgOldDesktop])

  return (
    <section className={`max-w-xl mx-auto ${className}`}>
      {imageFields.map((field) => (
        <div key={field.key}>
          <UploadFile
            label={field.label}
            images={field.imgs}
            setImages={field.setImgs as Dispatch<SetStateAction<(File | FileStateItem)[]>>}
            aspect={field.aspect}
            limitSize={LIMIT_BANNER_FILE_SIZE}
            classNameError="mt-2 mb-5"
            multiple={false}
            setImgsOld={field.setImgsOld as (imgs: FileStateItem[]) => void}
            items={field.imgs}
            refCollection="banners"
            imgsOld={field.imgsOld as FileStateItem[]}
            setItems={field.setImgs} />
          {field.error && <p className="text-red-500 font-light px-3.5 -mt-5 mb-4 text-sm">{field.error}</p>}
        </div>
      ))}

      <form
        onSubmit={onSubmit}
      >
        <label
          className="text-text-100 mb-2 block"
          htmlFor="alt">
          Texto alternativo <span className="text-accent-300">*</span>
        </label>
        <input
          id="alt"
          type="text"
          placeholder="Descripción de la imagen"
          className="w-full rounded-lg px-3.5 py-2.5 focus:outline-bg-200 bg-bg-50 text-text-200 font-light placeholder:text-gray-400 shadow-button"
          {...register("alt")}
        />
        {errors.alt?.message && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.alt?.message}</p>}

        <Button
          className="w-full mt-5"
        >
          <Save className="absolute top-1/2 -translate-y-1/2 left-0 ml-3.5 stroke-text-100" />
          <Spinner className={clsx("w-5 h-5 absolute opacity-0 transition-opacity", { "opacity-100": loading })} />
          <p className={clsx("transition-opacity", { "opacity-0": loading })}>Crear banner</p>
        </Button>
        {(error) && <p className="text-red-500 font-light px-3.5 mt-5 text-sm">{error}</p>}
      </form>
    </section>
  )
}
