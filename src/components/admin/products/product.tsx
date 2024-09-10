import { Product as ProductType } from "@/types/db/db"
import { OptionsProduct } from "./options-product"

export const Product = ({ imgs, name, price, stock, id }: ProductType) => {
  return (
    <li
      className="flex w-full gap-2 items-start rounded-lg justify-between lg:p-2 lg:hover:bg-bg-200 lg:transition-colors overflow-hidden"
    >
      <div className="flex gap-2 items-center justify-between overflow-hidden">
        <img
          className="w-16 object-cover rounded-lg aspect-[3/4]"
          loading="lazy"
          src={imgs[0].url} alt={`${name} - Bonita Maquillaje`}
          title={`${name} - Bonita Maquillaje`} />
        <div className="flex flex-col items-start overflow-hidden">
          <h3 className="text-lg text-text-100 whitespace-nowrap text-ellipsis overflow-hidden"
            title={name}
          >
            {name}
          </h3>
          <p className="text-lg text-accent-300 whitespace-nowrap text-ellipsis overflow-hidden flex items-center justify-center gap-1">
            ${price} <span className="text-text-200 font-light text-sm">- {stock} productos</span>
          </p>
        </div>
      </div>
      <OptionsProduct id={id} imgs={imgs} />
    </li>
  )
}