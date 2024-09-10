import { ProductSkeleton } from "./product-skeleton"

export const ProductsSkeletonContainer = ({ className }: { className?: string }) => {
  return (
    <ul className={`${className} grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-2`}>
      {
        Array(9).fill(0).map((_, index) => (
          <ProductSkeleton key={index} />
        ))
      }
    </ul>
  )
}