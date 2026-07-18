import { EditOrderForm } from "@/components/admin/orders/edit-order-form"
import { BackButton } from "@/components/common/back-button"
import { H1 } from "@/components/common/h1"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditOrderPage({
  params
}: Props) {
  const { id } = await params

  return (
    <main className="px-4 my-16 xl:px-0 lg:mt-20 max-w-5xl mx-auto">
      <BackButton href="/admin/pedidos" />
      <H1 className="mb-6 mt-2">Editar pedido</H1>
      <EditOrderForm id={id} />
    </main>
  )
}