import { OrderFormCart } from "@/components/cart/order-form-cart"
import { BackButtonCategory } from "@/components/catalogue/back-button-category"
import { BackButton } from "@/components/common/back-button"
import { H1 } from "@/components/common/h1"
import { Suspense } from "react"

export const metadata = {
  title: "Carrito de compras - Bonita Maquillaje",
  description: "Tu carrito de compras de Bonita Maquillaje. Encuentra los mejores productos de marcas Colombianas en maquillaje, skincare y accesorios.",
  authors: {
    name: "Rubert Gonzalez - Desarrollador web",
    url: "https://rubertweb.dev"
  }
}

function CartPage() {
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
      <OrderFormCart />
    </main>
  )
}

export default CartPage  