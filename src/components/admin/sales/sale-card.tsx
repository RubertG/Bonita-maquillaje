import { Order } from "@/types/db/db"
import { OptionsSaleCard } from "./options-sale-card"
import Skeleton from "react-loading-skeleton"

interface Props extends Order { 
  setReload: React.Dispatch<React.SetStateAction<boolean>>
}

export const SaleCard = ({ name, create_at, id, products, setReload }: Props) => {
  const getDate = () => {
    try {
      return create_at.toDate().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch (error) {
      const date = new Date(create_at.seconds * 1000)
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
  }

  const date = getDate()
  const productsCount = products.reduce((total, product) => total + product.amount, 0)

  return (
    <li
      className="flex w-full gap-2 items-start rounded-lg justify-between lg:p-2 lg:hover:bg-bg-200 lg:transition-colors overflow-hidden"
    >
      <div className="overflow-hidden flex flex-col justify-center h-full">
        <h3 className="text-text-100 text-ellipsis overflow-hidden whitespace-nowrap"
          title={name}
        >
          {name}
        </h3>
        <p className="text-sm font-light text-text-200 text-ellipsis overflow-hidden whitespace-nowrap">
          {
            getDate() === "" ? (
              <Skeleton
                className="w-full h-3"
              />
            ) : (
              date
            )
          } - {productsCount} productos
        </p>
      </div>
      <OptionsSaleCard id={id} setReload={setReload} />
    </li>
  )
}