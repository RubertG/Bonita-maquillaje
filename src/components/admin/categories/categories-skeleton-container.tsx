import { CategorySkeleton } from "@/components/common/category-skeleton"

export const CategoriesSkeletonContainer = ({ className, limit = 4 }: { className?: string, limit?: number }) => {
  return (
    <section className={`${className} flex gap-3 items-center overflow-x-auto scrollbar-hide md:justify-center`}>
      {
        Array(limit).fill(0).map((_, index) => (
          <CategorySkeleton key={index} />
        ))
      }
          <CategorySkeleton />

    </section>
  )
}