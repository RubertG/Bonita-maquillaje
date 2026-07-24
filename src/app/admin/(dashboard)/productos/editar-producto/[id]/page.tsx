import { EditProductForm } from "@/components/admin/products/edit-product-form"
import { BackButton } from "@/components/common/back-button"
import { H1 } from "@/components/common/h1"
import { getCategories } from "@/firebase/services/server/categories"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const categories = await getCategories()
  const categoryItems = categories.map(({ id, name }) => ({ id, name }))


  return (
    <main className="px-4 my-16 xl:px-0 lg:mt-20 max-w-5xl mx-auto">
      <BackButton
        href="/admin/productos" />
      <H1 className="mb-6 mt-2">Editar producto</H1>
      <EditProductForm id={id} categories={categoryItems} />
    </main>
  )
}