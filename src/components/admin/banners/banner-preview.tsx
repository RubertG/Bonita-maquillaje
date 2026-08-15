"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Popup } from "@/components/common/popup"
import { X } from "@/components/common/icons"
import { Banner } from "@/types/db/db"
import { BannerImage } from "@/types/admin/admin"
import clsx from "clsx"

type Variant = "mobile" | "desktop"

interface Props {
  banner: Banner
  initialVariant?: Variant
  onClose: () => void
}

export const BannerPreview = ({ banner, initialVariant = "mobile", onClose }: Props) => {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [variant, setVariant] = useState<Variant>(initialVariant)
  const hasDesktop = banner.imgDesktop !== undefined

  useEffect(() => {
    closeRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const image: BannerImage = variant === "desktop" && banner.imgDesktop
    ? banner.imgDesktop
    : banner.img

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

        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setVariant("mobile")}
            className={clsx(
              "px-3 py-1 rounded-lg text-sm font-light transition-colors",
              variant === "mobile"
                ? "bg-accent-200 text-text-100"
                : "bg-bg-100 text-text-200 lg:hover:bg-bg-200"
            )}
          >
            Móvil
          </button>
          {hasDesktop && (
            <button
              type="button"
              onClick={() => setVariant("desktop")}
              className={clsx(
                "px-3 py-1 rounded-lg text-sm font-light transition-colors",
                variant === "desktop"
                  ? "bg-accent-200 text-text-100"
                  : "bg-bg-100 text-text-200 lg:hover:bg-bg-200"
              )}
            >
              Escritorio
            </button>
          )}
        </div>

        <Image
          src={image.url}
          alt={banner.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1024px) 1024px, 92vw"
          className="w-full h-auto max-h-[calc(85vh-8rem)] object-contain rounded"
        />
        <p className="mt-2 text-center text-sm font-light text-text-200">
          {image.width} × {image.height} px — {variant === "mobile" ? "móvil" : "escritorio"}
        </p>
      </div>
    </Popup>
  )
}
