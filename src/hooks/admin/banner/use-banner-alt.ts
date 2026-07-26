"use client"

import { useRef, useState } from "react"
import { updateBanner as updateBannerAction } from "@/app/actions/admin/banners"
import { useBannerAdmin } from "@/contexts/admin/banners/banners-context"
import { getAuthToken } from "@/lib/auth-token"
import { bannerSchema } from "@/validations/admin/banners/banner"
import { Banner } from "@/types/db/db"

export const useBannerAlt = (banner: Banner) => {
  const { updateBanner } = useBannerAdmin()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(banner.alt)
  const [error, setError] = useState("")

  // Escape closes the field itself, so the blur it triggers must not also commit.
  const skipCommitRef = useRef(false)

  const startEditing = () => {
    // Reset here as well: unmounting the input on Escape does not reliably fire
    // blur, so a stale flag would otherwise swallow the next real save.
    skipCommitRef.current = false
    setValue(banner.alt)
    setError("")
    setEditing(true)
  }

  const cancel = () => {
    skipCommitRef.current = true
    setValue(banner.alt)
    setError("")
    setEditing(false)
  }

  // Leaving the field is the save gesture. The write is optimistic and runs after
  // the field has already closed, so editing never feels like it blocks.
  const commit = async () => {
    if (skipCommitRef.current) {
      skipCommitRef.current = false
      return
    }

    setEditing(false)

    // Same schema the create form uses, so an empty alt cannot slip in here either.
    const parsed = bannerSchema.shape.alt.safeParse(value)

    if (!parsed.success) {
      setValue(banner.alt)
      setError(parsed.error.issues[0].message)
      return
    }

    const alt = parsed.data

    if (alt === banner.alt) {
      setError("")
      return
    }

    const snapshot = banner
    const nextBanner: Banner = { ...banner, alt }

    setError("")
    updateBanner(nextBanner)

    const token = await getAuthToken()
    const result = await updateBannerAction(token, nextBanner)

    if (!result.ok) {
      updateBanner(snapshot)
      setValue(snapshot.alt)
      setError("No se pudo guardar el texto alternativo")
    }
  }

  return { editing, value, error, setValue, startEditing, cancel, commit }
}
