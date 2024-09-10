import { OrderFormCart } from "@/components/cart/order-form-cart"
import { BackButtonCategory } from "@/components/catalogue/back-button-category"
import { BackButton } from "@/components/common/back-button"
import { H1 } from "@/components/common/h1"
import { Suspense } from "react"

interface Props {
  params: {
    id: string
  },
  searchParams: {
    [key: string]: string | undefined
  }
}

export default function ProductPage({
  params: { id },
  searchParams: { color }
}: Props) {

  return (
    <main
      className="px-4 my-16 xl:px-0 lg:mt-20 max-w-6xl mx-auto"
    >
      <Suspense fallback={(
        <BackButton href="/catalogo" />
      )}>
        <BackButtonCategory />
      </Suspense>
      <H1 className="mb-8 mt-4 lg:mt-0">Resumen del pedido</H1>
      <OrderFormCart id={id} colorDefault={color} />
    </main>
  )
}