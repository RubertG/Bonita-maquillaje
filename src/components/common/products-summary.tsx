import { Product } from "@/types/cart/checkout"
import { formatCurrency } from "@/utils/format-currency"
import { getPayableUnitPrice } from "@/utils/offer-price"
import { PriceBlock } from "@/components/common/price-block"

interface Props {
  className?: string
  products: Product[]
}

function roundToDecimals(num: number) {
  return parseInt(num.toFixed(0))
}

export const ProductsSummary = ({
  products,
  className
}: Props) => {
  let subTotal = 0
  let total = 0

  // Subtotal is always at list price; the total carries the offer price and, when a
  // discount code applies, the code's percentage stacked on top of that offer price.
  for (const product of products) {
    subTotal += product.amount * product.price
    total += product.amount * getPayableUnitPrice(
      product.price,
      product.offerPrice,
      product.discountCode?.discount
    )
  }

  return (
    <section className={`px-4 py-2 bg-bg-50 rounded-lg shadow-button ${className}`}>
      <ul>
        {
          products?.map(product => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-1.5"
            >
              <p className="text-text-100 font-light overflow-hidden text-ellipsis whitespace-nowrap">{product.name}</p>
              <PriceBlock
                className="text-lg"
                price={product.price}
                offerPrice={product.offerPrice}
                discountPercent={product.discountCode?.discount}
                amount={product.amount}
              />
            </li>
          ))
        }
        <li
          className="flex items-center justify-between"
        >
          <p className="text-text-100 font-light overflow-hidden text-ellipsis whitespace-nowrap">Subtotal</p>
          <p className="text-accent-300 text-lg">{formatCurrency(roundToDecimals(subTotal))}</p>
        </li>
        <li
          className="flex items-center justify-between border-t border-bg-200 mt-2 pt-1"
        >
          <p className="text-text-100 overflow-hidden text-ellipsis whitespace-nowrap">Total</p>
          <p className="text-accent-300 text-lg">{formatCurrency(roundToDecimals(total))}</p>
        </li>
      </ul>
    </section>
  )
}
