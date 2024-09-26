import { CreateProductForm } from "@/components/admin/products/create-product-form"
import { BackButtonCategory } from "@/components/catalogue/back-button-category"
import { BackButton } from "@/components/common/back-button"
import { H1 } from "@/components/common/h1"
import { Suspense } from "react"

export default function CreateProductPage() {
  return (
    <main className="px-4 my-16 xl:px-0 lg:mt-20 max-w-5xl mx-auto">
      <Suspense fallback={(
        <BackButton
          href="/admin/productos" />
      )}>
        <BackButtonCategory
          href="/admin/productos"
        />
      </Suspense>
      <H1 className="mb-6 mt-2">Crear producto</H1>
      <CreateProductForm />
    </main>
  )
}