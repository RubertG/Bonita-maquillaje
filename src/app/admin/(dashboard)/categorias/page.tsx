import { CategoriesContainer } from "@/components/admin/categories/categories-container"
import { CategoryForm } from "@/components/admin/categories/category-form"
import { H1 } from "@/components/common/h1"
import { branch } from "@/fonts/branch/branch"

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function CategoriesPage({
  searchParams
}: Props) {
  const searchParamsResolved = await searchParams

  return (
    <main
      className="px-4 my-20 xl:px-0 max-w-6xl mx-auto">
      <H1 className="mb-6 mt-2">Categorías</H1>

      <CategoriesContainer className="mt-6 lg:mt-4" />

      <h2 className={`${branch.className} text-text-50 text-[2rem] md:text-3xl lg:text-4xl text-center mt-7`}>
        {
          searchParamsResolved.categoria ? `Editar categoría` : "Crear categoría"
        }
      </h2>
      <CategoryForm
        className="mt-5"
        id={searchParamsResolved.categoria} />
    </main>
  )
}