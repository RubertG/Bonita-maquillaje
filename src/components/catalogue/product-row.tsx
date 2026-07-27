import { CatalogProduct } from "@/types/server/catalog"
import { branch } from "@/fonts/branch/branch"
import { Link } from "next-view-transitions"
import { ProductCard } from "@/components/catalogue/product-card"
import { ScrollRow } from "@/components/common/scroll-row"

export const PRODUCT_ROW_LIMIT = 10

interface Props {
  title: string
  products: CatalogProduct[]
  viewAllHref: string
  eagerImages?: number
  className?: string
}

export const ProductRow = ({ title, products, viewAllHref, eagerImages = 0, className }: Props) => (
  <section className={className}>
    <header className="flex items-center justify-between gap-3">
      <h2 className={`text-2xl lg:text-3xl text-text-50 ${branch.className}`}>{title}</h2>
      <Link href={viewAllHref}
        className="shrink-0 text-sm text-accent-300 underline underline-offset-4 lg:hover:text-principal-300 lg:transition-colors">
        Ver todos<span className="sr-only">: {title}</span>
      </Link>
    </header>
    <ScrollRow
      className="mt-3 -mx-4"
      wrapperTag="ul"
      slideTag="li"
      slideClassName="!w-40 sm:!w-[11.5rem] lg:!w-52"
      offset={16}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          {...product}
          loading={index < eagerImages ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 208px, (min-width: 640px) 184px, 160px"
        />
      ))}
    </ScrollRow>
  </section>
)
