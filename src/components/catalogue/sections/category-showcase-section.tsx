import { CategoryShowcaseCard } from "@/components/catalogue/category-showcase-card"
import { getCategories } from "@/firebase/services/server/categories"
import { branch } from "@/fonts/branch/branch"

interface Props {
  className?: string
}

export async function CategoryShowcaseSection({ className }: Props) {
  const categories = await getCategories({ publicOnly: true })

  if (categories.length === 0) return null

  return (
    <section className={className}>
      <h2 className={`text-2xl lg:text-3xl text-text-50 text-center ${branch.className}`}>Nuestras categorías</h2>
      <ul className="mt-4 flex flex-wrap justify-center gap-4">
        {categories.map(category => (
          <li key={category.id} className="w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] aspect-square">
            <CategoryShowcaseCard category={category} />
          </li>
        ))}
      </ul>
    </section>
  )
}
