"use client"

import { Category as CategoryType } from "@/types/db/db"
import clsx from "clsx"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export const Category = ({ img, name, id }: CategoryType) => {
  const searchParams = useSearchParams()
  const isActive = searchParams.get("categoria") === id

  return (
    <Link
      className={clsx("p-2 rounded-lg lg:hover:bg-bg-200 transition-colors", {
        "bg-bg-200": isActive
      })}
      href={`?categoria=${id}`}
    >
      <img
        src={img.url}
        className="w-14 h-14 object-cover m-auto mb-1 aspect-square rounded-lg"
        title={`${name} - Bonita Maquillaje`}
        loading="lazy"
        alt={`${name} - Bonita Maquillaje`} />
      <h2
        className="text-sm text-accent-300 text-center font-light whitespace-nowrap"
      >{name}</h2>
    </Link>
  )
}