"use client"

import { updateBanner as updateBannerAction } from "@/app/actions/admin/banners"
import { AnimatedCheckbox } from "@/components/common/animated-checkbox"
import { Delete, Selector } from "@/components/common/icons"
import { PopupDelete } from "../common/popup-delete"
import { BannerAltField } from "./banner-alt-field"
import { BannerPreview } from "./banner-preview"
import { useBannerAdmin } from "@/contexts/admin/banners/banners-context"
import { useBannerDelete } from "@/hooks/admin/banner/use-banner-delete"
import { getAuthToken } from "@/lib/auth-token"
import { Banner } from "@/types/db/db"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { useState } from "react"

type PreviewVariant = "mobile" | "desktop"

interface Props {
  banner: Banner
  disabled?: boolean
}

export const BannerRow = ({ banner, disabled }: Props) => {
  const { updateBanner } = useBannerAdmin()
  const [togglingActive, setTogglingActive] = useState(false)
  const [preview, setPreview] = useState(false)
  const [previewVariant, setPreviewVariant] = useState<PreviewVariant>("mobile")
  const { loading, popup, error, handlePopup, handleDelete } = useBannerDelete(banner)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const handleToggleActive = async () => {
    const snapshot = banner
    const nextBanner: Banner = { ...banner, active: !banner.active }

    setTogglingActive(true)
    updateBanner(nextBanner)

    const token = await getAuthToken()
    const result = await updateBannerAction(token, nextBanner)

    if (!result.ok) {
      updateBanner(snapshot)
    }

    setTogglingActive(false)
  }

  return (
    <li
      style={style}
      ref={setNodeRef}
      className="rounded-lg bg-bg-50 shadow-button p-2.5"
    >
      <div className="flex w-full flex-wrap sm:flex-nowrap gap-3 items-center justify-between">
        <div className="flex w-full sm:w-auto gap-3 items-center min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="shrink-0 cursor-grab"
            aria-label="Reordenar banner"
            type="button"
          >
            <Selector className="stroke-text-300" />
          </button>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPreviewVariant("mobile")
                setPreview(true)
              }}
              aria-label={`Ver ${banner.alt} móvil en grande`}
              className="relative rounded-lg lg:hover:scale-105 lg:transition-transform"
            >
              <Image
                width={64}
                height={64}
                className="w-16 h-16 object-cover rounded-lg"
                loading="lazy"
                src={banner.img.url}
                alt=""
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-bg-50/90 text-[10px] text-text-200 font-light">
                M
              </span>
            </button>
            {banner.imgDesktop ? (
              <button
                type="button"
                onClick={() => {
                  setPreviewVariant("desktop")
                  setPreview(true)
                }}
                aria-label={`Ver ${banner.alt} escritorio en grande`}
                className="relative rounded-lg lg:hover:scale-105 lg:transition-transform"
              >
                <Image
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-lg"
                  loading="lazy"
                  src={banner.imgDesktop.url}
                  alt=""
                />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-bg-50/90 text-[10px] text-text-200 font-light">
                  D
                </span>
              </button>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-bg-100 flex items-center justify-center text-[10px] text-text-300 font-light text-center px-2">
                Sin desktop
              </div>
            )}
          </div>
          <BannerAltField banner={banner} disabled={disabled} />
        </div>
        <div className="flex gap-3 items-center shrink-0 ml-auto">
          <AnimatedCheckbox
            className="shrink-0"
            label="Activo"
            checked={banner.active}
            disabled={disabled || togglingActive}
            onChange={handleToggleActive}
          />
          <button
            type="button"
            onClick={handlePopup}
            aria-label={`Borrar ${banner.alt}`}
            className="shrink-0"
          >
            <Delete className="stroke-text-300 lg:hover:stroke-accent-300 lg:transition-colors" />
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 font-light text-sm mt-2">{error}</p>}
      {
        preview && (
          <BannerPreview banner={banner} initialVariant={previewVariant} onClose={() => setPreview(false)} />
        )
      }
      {
        popup && (
          <PopupDelete
            title="¿Deseas borrar este banner?"
            handleDelete={handleDelete}
            handlePopup={handlePopup}
            loading={loading}
          />
        )
      }
    </li>
  )
}
