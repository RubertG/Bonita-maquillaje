import Skeleton from "react-loading-skeleton"
import { ProductSkeleton } from "@/components/catalogue/product-skeleton"

const ROW_ITEM_CLASSNAME = "w-40 shrink-0 sm:w-[11.5rem] lg:w-52"

const RowSkeleton = () => (
  <section>
    <header className="flex items-center justify-between gap-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-20" />
    </header>
    <div className="mt-3 overflow-hidden -mx-4">
      <ul className="flex gap-3 px-4">
        {Array(5).fill(0).map((_, index) => (
          <ProductSkeleton key={index} className={ROW_ITEM_CLASSNAME} />
        ))}
      </ul>
    </div>
  </section>
)

export const CatalogLandingSkeleton = () => (
  <>
    <RowSkeleton />
    <RowSkeleton />
    <RowSkeleton />

    <section>
      <Skeleton className="h-8 w-56" />
      <ul className="mt-4 flex flex-wrap justify-center gap-4">
        {Array(3).fill(0).map((_, index) => (
          <li key={index} className="w-[calc(50%-0.5rem)] max-w-[22rem] lg:w-[calc(33.333%-0.6667rem)]">
            <Skeleton className="aspect-[4/3] rounded-2xl" />
          </li>
        ))}
      </ul>
    </section>
  </>
)
