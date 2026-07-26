"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Popup } from "@/components/common/popup"
import { X } from "@/components/common/icons"
import { Banner } from "@/types/db/db"

interface Props {
  banner: Banner
  onClose: () => void
}

export const BannerPreview = ({ banner, onClose }: Props) => {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  return (
    <Popup>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Vista previa: ${banner.alt}`}
        className="relative w-11/12 max-w-5xl max-h-[85vh] bg-bg-50 shadow-button rounded-lg p-3"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar vista previa"
          className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-bg-50 shadow-button lg:hover:scale-110 lg:transition-transform"
        >
          <X className="stroke-text-100" />
        </button>
        <Image
          src={banner.img.url}
          alt={banner.alt}
          width={banner.img.width}
          height={banner.img.height}
          sizes="(min-width: 1024px) 1024px, 92vw"
          className="w-full h-auto max-h-[calc(85vh-4rem)] object-contain rounded"
        />
        <p className="mt-2 text-center text-sm font-light text-text-200">
          {banner.img.width} × {banner.img.height} px
        </p>
      </div>
    </Popup>
  )
}
