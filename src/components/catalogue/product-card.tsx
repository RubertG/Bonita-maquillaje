import { CatalogProduct } from "@/types/server/catalog"
import { PriceBlock } from "@/components/common/price-block"
import Image from "next/image"
import { Link } from "next-view-transitions"
import { Photo } from "@/components/common/icons"
import { getDiscountPercent, resolveOfferPrice } from "@/utils/offer-price"

interface Props extends Pick<
  CatalogProduct,
  "name" | "price" | "imgs" | "id" | "offerPrice" | "isBestSeller" | "isNew"
> {
  priority?: boolean
  loading?: "eager" | "lazy"
  sizes?: string
}

const DEFAULT_SIZES = "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"

export const ProductCard = ({
  name, price, imgs, id, offerPrice, isBestSeller, isNew,
  priority = false, loading = "lazy", sizes = DEFAULT_SIZES
}: Props) => {
  const offer = resolveOfferPrice(price, offerPrice)
  const discount = offer !== null ? getDiscountPercent(price, offer) : null
  const status = isBestSeller ? "🔥 Más vendido" : isNew ? "⏰ Nuevo" : null

  return (
    <div className="p-2 rounded-lg hover:bg-bg-200 cursor-pointer transition-colors duration-200">
      <Link className="block" href={`/catalogo/${id}`}>
        <div className="relative">
          {imgs[0]?.url ? (
            <Image
              width={200}
              height={150}
              className="w-full aspect-[3/4] object-cover rounded-lg bg-bg-200"
              src={imgs[0].url}
              alt={`${name} - Bonita Maquillaje`}
              priority={priority}
              loading={priority ? undefined : loading}
              sizes={sizes}
            />
          ) : (
            <div className="w-full aspect-[3/4] rounded-lg bg-bg-200 flex flex-col items-center justify-center gap-2 text-text-200">
              <Photo className="w-10 h-10" />
              <span className="text-sm">Sin imagen</span>
            </div>
          )}

          {discount !== null && (
            <p className="absolute top-1.5 left-1.5 rounded-full bg-discount-100 text-bg-50 text-xs px-2 py-0.5 shadow-button">
              <span aria-hidden="true">-{discount}%</span>
              <span className="sr-only">{discount}% de descuento</span>
            </p>
          )}

          {status !== null && (
            <p className="absolute top-1.5 right-1.5 rounded-full bg-accent-100 text-principal-300 text-xs px-2 py-0.5 shadow-button">
              {status}
            </p>
          )}
        </div>

        <footer className="mt-2 text-center px-2">
          <p className="text-text-100 text-sm line-clamp-2">{name}</p>
          <PriceBlock price={price} offerPrice={offerPrice} className="text-sm lg:text-base lg:-mt-0.5" />
        </footer>
      </Link>
    </div>
  )
}
