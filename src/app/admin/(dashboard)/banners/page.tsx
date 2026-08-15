import { BannerForm } from "@/components/admin/banners/banner-form"
import { BannersContainer } from "@/components/admin/banners/banners-container"
import { BannerAdminProvider } from "@/contexts/admin/banners/banners-context"
import { H1 } from "@/components/common/h1"
import { branch } from "@/fonts/branch/branch"
import { getBanners } from "@/firebase/services/server/banners"

export default async function BannersPage() {
  const banners = await getBanners()

  return (
    <BannerAdminProvider initialBanners={banners}>
      <main
        className="px-4 my-20 xl:px-0 max-w-6xl mx-auto">
        <H1 className="mb-6 mt-2">Banners</H1>

        <BannersContainer className="mt-6 lg:mt-4" />

        <h2 className={`${branch.className} text-text-50 text-[2rem] md:text-3xl lg:text-4xl text-center mt-7`}>
          Crear banner
        </h2>
        <BannerForm className="mt-5" />
      </main>
    </BannerAdminProvider>
  )
}
