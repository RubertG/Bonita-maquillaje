import { EditProductForm } from "@/components/admin/products/edit-product-form"
import { BackButton } from "@/components/common/back-button"
import { H1 } from "@/components/common/h1"

interface Props {
  params: {
    id: string
  }
}

export default function EditProductPage({ params: { id } }: Props) {
  return (
    <main className="px-4 my-16 xl:px-0 lg:mt-20 max-w-5xl mx-auto">
      <BackButton
        href="/admin/productos" />
      <H1 className="mb-6 mt-2">Editar producto</H1>
      <EditProductForm id={id} />
    </main>
  )
}