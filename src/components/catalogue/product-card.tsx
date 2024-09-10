import { Product } from "@/types/db/db"
import Link from "next/link"

export const ProductCard = ({ name, price, imgs, id }: Product) => {
  return (
    <Link
      href={`/catalogo/${id}`}
      className="lg:p-2.5 rounded-lg lg:hover:bg-bg-200 cursor-pointer lg:transition-colors">
      <img
        className="w-full aspect-[3/4] object-cover rounded-lg"
        src={imgs[0].url}
        alt={`${name} - Bonita Maquillaje`}
        loading="lazy"
      />
      <footer className="mt-2 text-center">
        <h2 className="text-text-100 overflow-hidden text-ellipsis whitespace-nowrap">
          {name}
        </h2>
        <p className="text-accent-300 text-sm lg:text-base lg:-mt-0.5">
          ${price}
        </p>
      </footer>
    </Link>
  )
}