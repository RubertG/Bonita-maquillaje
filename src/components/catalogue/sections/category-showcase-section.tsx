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
      {/* items-start keeps flex from stretching the items and breaking aspect-square. */}
      <ul className="mt-4 grid grid-cols-2 items-center sm:flex sm:flex-wrap sm:justify-center gap-4 md:gap-6">
        {categories.map(category => (
          <li key={category.id} className="w-full sm:max-w-[220px] md:max-w-[260px] aspect-square">
            <CategoryShowcaseCard category={category} />
          </li>
        ))}
      </ul>
    </section>
  )
}
