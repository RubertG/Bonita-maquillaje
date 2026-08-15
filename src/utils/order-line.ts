import { Product } from "@/types/cart/checkout"
import { Order } from "@/types/db/db"

type OrderLine = Order["products"][number]

// An order line freezes what the customer actually paid. `getOrder` hydrates a line as
// `{ ...currentProduct, ...line }`, so these fields override whatever the product costs
// today and a historical total stays stable when prices or offers change later.
export const toOrderLine = (product: Product): OrderLine => ({
  id: product.id,
  amount: product.amount,
  price: product.price,
  offerPrice: product.offerPrice ?? null,
  ...(product.discountCode ? { discountCode: product.discountCode } : {}),
  ...(product.tone ? { tone: product.tone } : {})
})
