"use client"

import { reorderBanners as reorderBannersAction } from "@/app/actions/admin/banners"
import { getAuthToken } from "@/lib/auth-token"
import { Banner } from "@/types/db/db"
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react"

interface BannerAdminContextValue {
  banners: Banner[]
  reordering: boolean
  setBanners: (banners: Banner[]) => void
  addBanner: (banner: Banner) => void
  updateBanner: (banner: Banner) => void
  deleteBanner: (id: string) => void
  reorderBanners: (banners: Banner[]) => Promise<void>
}

const BannerAdminContext = createContext<BannerAdminContextValue>({
  banners: [],
  reordering: false,
  setBanners: () => { },
  addBanner: () => { },
  updateBanner: () => { },
  deleteBanner: () => { },
  reorderBanners: async () => { }
})

export const BannerAdminProvider = ({
  children,
  initialBanners = []
}: {
  children: ReactNode
  initialBanners?: Banner[]
}) => {
  const [banners, setBanners] = useState(initialBanners)
  const [reordering, setReordering] = useState(false)

  const addBanner = (banner: Banner) => {
    setBanners(prev => [...prev, banner])
  }

  const updateBanner = (banner: Banner) => {
    setBanners(prev => prev.map(item => item.id === banner.id ? banner : item))
  }

  const deleteBanner = (id: string) => {
    setBanners(prev => prev.filter(item => item.id !== id))
  }

  const reorderBanners = useCallback(async (nextBanners: Banner[]) => {
    const snapshot = banners
    const normalized = nextBanners.map((banner, index) => ({ ...banner, order: index }))

    const orders = normalized
      .filter(banner => banner.order !== snapshot.find(item => item.id === banner.id)?.order)
      .map(({ id, order }) => ({ id, order }))

    setBanners(normalized)

    if (orders.length === 0) return

    setReordering(true)

    const token = await getAuthToken()
    const result = await reorderBannersAction(token, orders)

    if (!result.ok) {
      setBanners(snapshot)
    }

    setReordering(false)
  }, [banners])

  const value = useMemo(
    () => ({ banners, reordering, setBanners, addBanner, updateBanner, deleteBanner, reorderBanners }),
    [banners, reordering, reorderBanners]
  )

  return (
    <BannerAdminContext.Provider value={value}>
      {children}
    </BannerAdminContext.Provider>
  )
}

export const useBannerAdmin = () => useContext(BannerAdminContext)
