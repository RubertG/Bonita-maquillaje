export const resolveOfferPrice = (
  price: number,
  offerPrice?: number | null
): number | null =>
  offerPrice != null && offerPrice < price && price > 0 ? offerPrice : null

export const getDiscountPercent = (price: number, offerPrice: number): number =>
  Math.round((1 - offerPrice / price) * 100)

// The price the customer actually pays per unit before any discount code.
export const getEffectivePrice = (
  price: number,
  offerPrice?: number | null
): number => resolveOfferPrice(price, offerPrice) ?? price

// A discount code stacks on top of an offer: the code's percentage applies to the
// offer price, not to the list price, so the two discounts compound instead of the
// larger one swallowing the smaller.
export const getPayableUnitPrice = (
  price: number,
  offerPrice?: number | null,
  discountPercent?: number
): number => {
  const effective = getEffectivePrice(price, offerPrice)
  if (!discountPercent) return effective
  return effective * ((100 - discountPercent) / 100)
}
