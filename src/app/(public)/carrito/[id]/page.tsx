import { OrderFormCart } from "@/components/cart/order-form-cart"
import { BackButtonCategory } from "@/components/catalogue/back-button-category"
import { BackButton } from "@/components/common/back-button"
import { H1 } from "@/components/common/h1"
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
      className="px-4 my-20 xl:px-0 max-w-6xl mx-auto"
    >
      <Suspense fallback={(
        <BackButton href="/catalogo" />
      )}>
        <BackButtonCategory />
      </Suspense>
      <H1 className="mb-8 mt-4 lg:mt-0">Resumen del pedido</H1>
      <OrderFormCart className="mt-4" id={id} colorDefault={color} />
    </main>
  )
}