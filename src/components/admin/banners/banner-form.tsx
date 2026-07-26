"use client"

import { UploadFile } from "../common/upload-file"
import { LIMIT_BANNER_FILE_SIZE } from "@/consts/admin/admin"
import { Button } from "@/components/common/button"
import { Save, Spinner } from "@/components/common/icons"
import clsx from "clsx"
import { useBannerForm } from "@/hooks/admin/banner/use-banner-form"
import { Dispatch, SetStateAction } from "react"
import { FileStateItem } from "@/types/admin/admin"

interface Props {
  className?: string
}

export const BannerForm = ({ className }: Props) => {
  const {
    error, errorImgs, errors,
    imgs, loading, onSubmit,
    register, setImgs, imgOld, setImgOld
  } = useBannerForm()

  return (
    <section className={`max-w-xl mx-auto ${className}`}>
      <UploadFile
        images={imgs}
        setImages={setImgs as Dispatch<SetStateAction<(File | FileStateItem)[]>>}
        aspect="17/9"
        limitSize={LIMIT_BANNER_FILE_SIZE}
        classNameError="mt-2 mb-5"
        multiple={false}
        setImgsOld={setImgOld as (imgs: FileStateItem[]) => void}
        items={imgs}
        refCollection="banners"
        imgsOld={imgOld as FileStateItem[]}
        setItems={setImgs} />
      {(errorImgs) && <p className="text-red-500 font-light px-3.5 -mt-5 mb-4 text-sm">{errorImgs}</p>}

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
