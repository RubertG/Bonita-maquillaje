"use client"

import { useState } from "react"
import { deleteBanner as deleteBannerAction } from "@/app/actions/admin/banners"
import { deleteFile } from "@/firebase/services/storage"
import { useBannerAdmin } from "@/contexts/admin/banners/banners-context"
import { getAuthToken } from "@/lib/auth-token"
import { Banner } from "@/types/db/db"

export const useBannerDelete = (banner: Banner) => {
  const { deleteBanner: deleteStoreBanner, addBanner } = useBannerAdmin()
  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState(false)
  const [error, setError] = useState("")

  const handlePopup = () => setPopup(current => !current)

  const handleDelete = async () => {
    setLoading(true)
    setError("")

    // Optimistic removal, restored below if the server rejects the write.
    deleteStoreBanner(banner.id)

    try {
      const token = await getAuthToken()
      const result = await deleteBannerAction(token, banner.id)

      if (!result.ok) {
        throw new Error(result.error)
      }

      // The Storage object is only removed once the document is gone, so a failed
      // document delete never leaves a banner pointing at a missing image.
      await deleteFile(`banners/${banner.img.name}`)

      if (banner.imgDesktop) {
        try {
          await deleteFile(`banners/${banner.imgDesktop.name}`)
        } catch {
          // Ignore a missing desktop object so legacy banners still delete cleanly.
        }
      }

      setPopup(false)
    } catch {
      addBanner(banner)
      setError("Ocurrió un error al borrar el banner")
    } finally {
      setLoading(false)
    }
  }

  return { loading, popup, error, handlePopup, handleDelete }
}
