import { OrderFormCart } from "@/components/cart/order-form-cart"
import { BackButtonCategory } from "@/components/catalogue/back-button-category"
import { BackButton } from "@/components/common/back-button"
import { Suspense } from "react"

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function ProductPage({
  params,
  searchParams
}: Props) {
  const { id } = await params
  const { color } = await searchParams

  return (
    <main
      className="px-4 my-16 xl:px-0 lg:mt-20 max-w-6xl mx-auto"
    >
      <Suspense fallback={(
        <BackButton href="/catalogo" />
      )}>
        <BackButtonCategory />
      </Suspense>
      <OrderFormCart className="mt-4" id={id} colorDefault={color} />
    </main>
  )
}