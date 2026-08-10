import { CategoriesContainer } from "@/components/admin/categories/categories-container"
import { CategoryForm } from "@/components/admin/categories/category-form"
import { H1 } from "@/components/common/h1"
import { branch } from "@/fonts/branch/branch"
import { getCategories } from "@/firebase/services/server/categories"

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function CategoriesPage({
  searchParams
}: Props) {
  const [searchParamsResolved, categories] = await Promise.all([
    searchParams,
    getCategories()
  ])

  return (
    <main
      className="px-4 my-20 xl:px-0 max-w-6xl mx-auto">
      <H1 className="mb-6 mt-2">Categorías</H1>

      {/* Stacked up to md, where a row already needs the full width. From lg the
          list and the form sit side by side, so editing a category no longer
          means scrolling past every other one. The list column is the wider of
          the two because its rows carry the reorder controls. */}
      <div className="max-w-2xl mx-auto lg:max-w-none grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
        <CategoriesContainer
          className="mt-6 lg:mt-0"
          initialCategories={categories}
          editingId={searchParamsResolved.categoria}
        />

        <section>
          <h2 className={`${branch.className} text-text-50 text-[2rem] md:text-3xl lg:text-4xl text-center`}>
            {
              searchParamsResolved.categoria ? `Editar categoría` : "Crear categoría"
            }
          </h2>
          <CategoryForm
            className="mt-5"
            id={searchParamsResolved.categoria} />
        </section>
      </div>
    </main>
  )
}