import { CategoriesContainer } from "@/components/catalogue/categories-container"
import { getCategories } from "@/firebase/services/server/categories"

export async function CategoriesSection() {
  const categories = await getCategories()

  return <CategoriesContainer className="mt-6 lg:mt-4" initialCategories={categories} />
}
