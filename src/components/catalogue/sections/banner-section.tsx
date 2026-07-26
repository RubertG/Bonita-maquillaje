import { BannerCarousel } from "@/components/catalogue/banner-carousel"
import { getActiveBanners } from "@/firebase/services/server/banners"

interface Props {
  className?: string
}

export async function BannerSection({ className }: Props) {
  const banners = await getActiveBanners()

  if (banners.length === 0) return null

  return <BannerCarousel className={className} banners={banners} />
}
