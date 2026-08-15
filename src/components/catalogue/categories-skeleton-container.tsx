import { CategorySkeleton } from "@/components/common/category-skeleton"
import clsx from "clsx"

interface Props {
  className?: string
  limit?: number
  variant?: "default" | "list"
}

export const CategoriesSkeletonContainer = ({ className, limit = 4, variant = "default" }: Props) => {
  return (
    <section
      className={clsx(
        "flex",
        {
          "w-full flex-col gap-1": variant === "list",
          "items-center gap-3 overflow-hidden md:justify-center": variant === "default"
        },
        className
      )}
    >
      {Array(limit).fill(0).map((_, index) => (
        <CategorySkeleton key={index} variant={variant} />
      ))}
    </section>
  )
}
