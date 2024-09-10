import { DiscountCodeContainer } from "@/components/admin/discount-codes/discount-code-container"
import { DiscountCodeForm } from "@/components/admin/discount-codes/discount-code-form"
import { H1 } from "@/components/common/h1"

export const revalidate = 0
export const dynamic = "force-dynamic"

function DiscountCodesPage() {
  return (
    <main className="px-4 my-16 xl:px-0 lg:mt-20 max-w-6xl mx-auto">
      <H1 className="mb-6 mt-2">Agregar código de descuento</H1>
      <section className="flex flex-col gap-4 max-w-lg mx-auto lg:grid lg:grid-cols-2 lg:gap-6 lg:max-w-none lg:mt-10">
        <DiscountCodeForm />
        <DiscountCodeContainer />
      </section>
    </main>
  )
}

export default DiscountCodesPage