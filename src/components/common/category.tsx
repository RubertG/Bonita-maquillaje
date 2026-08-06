"use client"

import { Category as CategoryType } from "@/types/db/db"
import clsx from "clsx"
import { Link } from "next-view-transitions"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

export const Category = ({ img, name, id }: CategoryType) => {
  const searchParams = useSearchParams()
  const isActive = searchParams.get("categoria") === id

  return (
    <Link
      // Fixed square: the name no longer drives the width, so a short label and a
      // long one render the same card.
      className={clsx(
        "p-2 rounded-lg lg:hover:bg-bg-200 transition-colors flex flex-col items-center justify-center gap-1 w-24 shrink-0 aspect-square overflow-hidden",
        {
          "bg-bg-200": isActive
        }
      )}
      href={`?categoria=${id}`}
    >
      <Image
        width={70}
        height={70}
        src={img.url}
        className="w-12 h-12 shrink-0 object-cover aspect-square rounded-lg"
        title={`${name} - Bonita Maquillaje`}
        loading="lazy"
        alt={`${name} - Bonita Maquillaje`} />
      {/* Long names wrap to two lines and clamp instead of widening the card. */}
      <h2
        className="text-xs leading-tight text-accent-300 text-center font-light line-clamp-2"
      >{name}</h2>
    </Link>
  )
}