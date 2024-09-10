import { DiscountCode } from "@/types/db/db"
import { OptionsDCCard } from "./options-d-c-card"

export const DiscountCodeCard = ({
  code, discount, expiration, category
}: DiscountCode) => {
  const date = expiration.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  const inDate = new Date() <= expiration.toDate()

  return (
    <li
      className="flex w-full gap-2 items-start rounded-lg justify-between lg:p-2 lg:hover:bg-bg-200 lg:transition-colors"
    >
      <div className="overflow-hidden flex flex-col justify-center h-full">
        <h3 className="text-text-100 text-ellipsis overflow-hidden whitespace-nowrap"
          title={`Código de descuento - ${code}`}>
          {code}
        </h3>
        <p className="text-sm font-light text-text-200 text-ellipsis overflow-hidden whitespace-nowrap">
          {inDate ? 'Vence' : 'Venció'} el {date}
        </p>
        <p className="text-sm font-light text-text-200 text-ellipsis overflow-hidden whitespace-nowrap">
          {category} - <span className="text-accent-300 font-medium">{discount}%</span> de descuento
        </p>
      </div>
      <OptionsDCCard code={code} />
    </li>
  )
}