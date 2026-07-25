import { CategoriesContainer } from "@/components/catalogue/categories-container"
import { getCategories } from "@/firebase/services/server/categories"

interface Props {
  baseHref?: string
}

export async function CategoriesSection({ baseHref }: Props) {
  const categories = await getCategories()

  return <CategoriesContainer className="mt-6 lg:mt-4" initialCategories={categories} baseHref={baseHref} />
}
