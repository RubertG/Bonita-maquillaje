import { Product as ProductType } from "@/types/db/db"
import { OptionsProduct } from "./options-product"
import { formatCurrency } from "@/utils/format-currency"
import { getDiscountPercent, resolveOfferPrice } from "@/utils/offer-price"
import Image from "next/image"

export const Product = ({
  imgs,
  name,
  price,
  stock,
  id,
  offerPrice,
  isBestSeller,
  isNew
}: ProductType) => {
  const offer = resolveOfferPrice(price, offerPrice)
  const discount = offer !== null ? getDiscountPercent(price, offer) : null

  return (
    <li
      className="flex w-full gap-2 items-start rounded-lg justify-between lg:p-2 lg:hover:bg-bg-200 lg:transition-colors overflow-hidden"
    >
      <div className="flex gap-2 items-center justify-between overflow-hidden">
        <Image
          width={64}
          height={64 * (3 / 4)}
          className="w-16 object-cover rounded-lg aspect-[3/4]"
          src={imgs[0].url} alt={`${name} - Bonita Maquillaje`}
          title={`${name} - Bonita Maquillaje`} />
        <div className="flex flex-col items-start overflow-hidden">
          <h3 className="text-lg text-text-100 whitespace-nowrap text-ellipsis overflow-hidden"
            title={name}
          >
            {name}
          </h3>
          <p className="text-lg text-accent-300 whitespace-nowrap text-ellipsis overflow-hidden flex items-center gap-1">
            {
              offer !== null ? (
                <>
                  <span className="text-text-300 text-sm line-through">{formatCurrency(price)}</span>
                  <span className="text-discount-100">{formatCurrency(offer)}</span>
                </>
              ) : (
                formatCurrency(price)
              )
            }
            <span className="text-text-200 font-light text-sm">- {stock} productos</span>
          </p>
          {
            (discount !== null || isBestSeller || isNew) && (
              <ul className="flex flex-wrap items-center gap-1 mt-1 list-none">
                {
                  discount !== null && (
                    <li className="rounded-full bg-discount-100 text-bg-50 text-xs px-2 py-0.5">
                      <span aria-hidden="true">-{discount}%</span>
                      <span className="sr-only">{discount}% de descuento</span>
                    </li>
                  )
                }
                {
                  isBestSeller && (
                    <li className="rounded-full bg-accent-100 text-principal-300 text-xs px-2 py-0.5">
                      Más vendido
                    </li>
                  )
                }
                {
                  isNew && (
                    <li className="rounded-full border border-principal-200 text-principal-300 text-xs px-2 py-0.5">
                      Nuevo
                    </li>
                  )
                }
              </ul>
            )
          }
        </div>
      </div>
      <OptionsProduct id={id} imgs={imgs} />
    </li>
  )
}