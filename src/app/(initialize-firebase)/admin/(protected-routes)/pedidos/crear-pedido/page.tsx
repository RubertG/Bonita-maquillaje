import { CreateOrderForm } from "@/components/admin/orders/create-order-form"
import { BackButton } from "@/components/common/back-button"
import { H1 } from "@/components/common/h1"

export default function CreateOrderPage() {
  return (
    <main className="px-4 my-16 xl:px-0 lg:mt-20 max-w-5xl mx-auto">
      <BackButton href="/admin/pedidos" />
      <H1 className="mb-6 mt-2">Crear pedido</H1>
      <CreateOrderForm />
    </main>
  )
}