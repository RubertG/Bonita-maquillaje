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

interface Props {
  banner: Banner
  disabled?: boolean
}

export const BannerRow = ({ banner, disabled }: Props) => {
  const { updateBanner } = useBannerAdmin()
  const [togglingActive, setTogglingActive] = useState(false)
  const [preview, setPreview] = useState(false)
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
      <div className="flex w-full gap-3 items-center justify-between">
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab"
          aria-label="Reordenar banner"
          type="button"
        >
          <Selector className="stroke-text-300" />
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          aria-label={`Ver ${banner.alt} en grande`}
          className="shrink-0 rounded-lg lg:hover:scale-105 lg:transition-transform"
        >
          <Image
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-lg"
            loading="lazy"
            src={banner.img.url}
            alt=""
          />
        </button>
        <BannerAltField banner={banner} disabled={disabled} />
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
      {error && <p className="text-red-500 font-light text-sm mt-2">{error}</p>}
      {
        preview && (
          <BannerPreview banner={banner} onClose={() => setPreview(false)} />
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
