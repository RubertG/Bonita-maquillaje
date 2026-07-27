import clsx from "clsx"
import { formatCurrency } from "@/utils/format-currency"
import { getPayableUnitPrice, resolveOfferPrice } from "@/utils/offer-price"

interface Props {
  price: number
  offerPrice?: number | null
  // Discount-code percentage, stacked on top of the offer price when present.
  discountPercent?: number
  // Multiplies both the list and the payable price, for line totals in the cart.
  amount?: number
  className?: string
  previousClassName?: string
  currentClassName?: string
}

export const PriceBlock = ({
  price,
  offerPrice,
  discountPercent,
  amount = 1,
  className,
  previousClassName,
  currentClassName
}: Props) => {
  const hasOffer = resolveOfferPrice(price, offerPrice) !== null
  const payable = getPayableUnitPrice(price, offerPrice, discountPercent)
  const isReduced = hasOffer || (discountPercent != null && discountPercent > 0)

  if (!isReduced) {
    return (
      <p className={clsx("text-accent-300", className)}>
        {formatCurrency(Math.ceil(price * amount))}
      </p>
    )
  }

  return (
    <p className={clsx("flex items-center justify-center gap-1.5", className)}>
      <span className="sr-only">Precio anterior: </span>
      <span className={clsx("text-text-300 text-xs lg:text-sm line-through", previousClassName)}>
        {formatCurrency(Math.ceil(price * amount))}
      </span>
      <span className="sr-only">Precio actual: </span>
      <span className={clsx("text-discount-100", currentClassName)}>
        {formatCurrency(Math.ceil(payable * amount))}
      </span>
    </p>
  )
}
