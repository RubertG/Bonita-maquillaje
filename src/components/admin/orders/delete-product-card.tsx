"use client"

import { Delete } from "@/components/common/icons"
import { Product } from "@/types/admin/admin"
import { PriceBlock } from "@/components/common/price-block"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface Props {
  product: Product
  onClick: (product: Product) => void
  changeCount: (product: Product, count: number) => void
}

export const DeleteProductCard = ({
  onClick, product, changeCount
}: Props) => {
  const [count, setCount] = useState(product.amount)

  return (
    <li
      className="flex w-full gap-2 items-center justify-between rounded-lg lg:hover:bg-bg-100 lg:transition-colors">
      <div className="flex gap-2 items-center overflow-hidden w-full">
        <Image
          width={64}
          height={64 * (3 / 4)}
          className="w-16 object-cover rounded-lg aspect-[3/4]"
          src={product.imgs[0].url} alt={`${product.name} - Bonita Maquillaje`}
          title={`${product.name} - Bonita Maquillaje`}
        />
        <div className="flex flex-col items-start justify-start gap-1 overflow-hidden py-2">
          <h3 className="lg:text-lg text-text-100 text-ellipsis overflow-hidden whitespace-nowrap"
            title={product.name}
          >
            <Link
              href={`/catalogo/${product.id}${product.tone ? `?color=${product.tone.color}` : ""}`}
              target="_blank"
              title={`Ir al producto ${product.name}`}>
              {product.name}
            </Link>
          </h3>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex bg-bg-50 rounded-lg shadow-button items-center justify-center">
              <button
                onClick={() => {
                  if (count === 1) return
                  setCount(count - 1)
                  changeCount(product, count - 1)
                }}
                className="py-4 px-3">
                <span className="w-3.5 h-[2px] bg-text-300 rounded-lg block" />
              </button>
              <p className="px-2 text-accent-300 text-lg">
                {count}
              </p>
              <button
                onClick={() => {
                  setCount(count + 1)
                  changeCount(product, count + 1)
                }}
                className="py-4 px-3">
                <span className="w-3.5 h-[2px] bg-text-300 rounded-lg block" />
                <span className="w-3.5 h-[2px] bg-text-300 rounded-lg block rotate-90 -translate-y-full" />
              </button>
            </div>
            <PriceBlock
              price={product.price}
              offerPrice={product.offerPrice}
              discountPercent={product.discountCode?.discount}
            />
            {
              product.tone && (
                <span
                  className="inline-block rounded-full w-5 h-5 shadow-button"
                  title={product.tone.name}
                  style={{ backgroundColor: product.tone?.color }}
                />
              )
            }
          </div>
        </div>
      </div>
      <button
        onClick={() => onClick(product)}
      >
        <Delete className="w-5 h-5 stroke-text-200 lg:hover:scale-125 lg:transition-transform" />
      </button>
    </li>
  )
}
