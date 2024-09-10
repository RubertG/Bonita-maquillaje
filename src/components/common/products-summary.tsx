import { Product } from "@/types/admin/admin"

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

  for (const product of products) {
    subTotal += product.amount * product.price
    if (product.discountCode) {
      total += product.amount * product.price * ((100 - product.discountCode.discount) / 100)
    } else {
      total += product.amount * product.price
    }
  }

  return (
    <section className={`px-4 py-2 bg-bg-50 rounded-lg shadow-button ${className}`}>
      <ul>
        {
          products?.map(product => {
            const total = roundToDecimals(product.amount * product.price)

            return (
              <li
                key={product.id}
                className="flex items-center justify-between gap-1.5"
              >
                <p className="text-text-100 font-light overflow-hidden text-ellipsis whitespace-nowrap">{product.name}</p>
                <p className="text-accent-300 text-lg flex items-center gap-2">
                  {
                    product.discountCode ? (
                      <>
                        <span className="text-xs lg:text-sm line-through">
                          ${total}
                        </span>
                        ${roundToDecimals((total * (100 - product.discountCode.discount) / 100))}
                      </>
                    ) : (
                      <>${total}</>
                    )
                  }
                </p>
              </li>
            )
          })
        }
        <li
          className="flex items-center justify-between"
        >
          <p className="text-text-100 font-light overflow-hidden text-ellipsis whitespace-nowrap">Subtotal</p>
          <p className="text-accent-300 text-lg">${roundToDecimals(subTotal)}</p>
        </li>
        <li
          className="flex items-center justify-between border-t border-bg-200 mt-2 pt-1"
        >
          <p className="text-text-100 overflow-hidden text-ellipsis whitespace-nowrap">Total</p>
          <p className="text-accent-300 text-lg">${roundToDecimals(total)}</p>
        </li>
      </ul>
    </section>
  )
}