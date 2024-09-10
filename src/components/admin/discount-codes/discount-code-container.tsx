import { getDiscountCodes } from "@/firebase/services/discount-codes"
import { DiscountCodeCard } from "./discount-code-card"

export const DiscountCodeContainer = async () => {
  const discountCodes = await getDiscountCodes()

  return (
    <section className="flex flex-col gap-4 lg:gap-1">
      {
        discountCodes.map(discountCode => (
          <DiscountCodeCard
            key={discountCode.code}
            {...discountCode}
          />
        ))
      }
    </section>
  )
}