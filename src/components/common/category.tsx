"use client"

import { Category as CategoryType } from "@/types/db/db"
import clsx from "clsx"
import { Link } from "next-view-transitions"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

interface Props extends CategoryType {
  isActive?: boolean
  asButton?: boolean
  onClick?: () => void
  href?: string
}

export const Category = ({
  img,
  name,
  id,
  isActive,
  asButton = false,
  onClick,
  href
}: Props) => {
  const searchParams = useSearchParams()
  const activeByParam = searchParams.getAll("categoria").includes(id)
  const active = isActive ?? activeByParam

  const className = clsx(
    "p-2 rounded-lg lg:hover:bg-bg-200 transition-colors flex flex-col items-center min-w-[4.5rem]",
    {
      "bg-bg-200": active
    }
  )

  const content = (
    <>
      <Image
        width={70}
        height={70}
        src={img.url}
        className="w-14 h-14 object-cover m-auto mb-1 aspect-square rounded-lg"
        title={`${name} - Bonita Maquillaje`}
        loading="lazy"
        alt={`${name} - Bonita Maquillaje`}
      />
      <h2 className="text-sm text-accent-300 text-center font-light whitespace-nowrap">
        {name}
      </h2>
    </>
  )

  if (asButton || onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={className}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      className={className}
      href={href || `?categoria=${id}`}
    >
      {content}
    </Link>
  )
}
