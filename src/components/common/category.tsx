"use client"

import { Category as CategoryType } from "@/types/db/db"
import clsx from "clsx"
import { Link } from "next-view-transitions"
import Image from "next/image"
import { Check } from "@/components/common/icons"

interface Props extends CategoryType {
  isActive?: boolean
  asButton?: boolean
  onClick?: () => void
  href?: string
  variant?: "default" | "list"
}

export const Category = ({
  img,
  name,
  id,
  isActive,
  asButton = false,
  onClick,
  href,
  variant = "default"
}: Props) => {
  const isList = variant === "list"

  const className = clsx(
    "rounded-lg lg:hover:bg-bg-200 transition-colors",
    {
      "bg-bg-200": isActive,
      "p-2 flex flex-col items-center min-w-[4.5rem]": !isList,
      "w-full flex items-center justify-between px-3 py-2 text-left text-sm text-text-100": isList
    }
  )

  const content = isList ? (
    <>
      <span className="flex-1">{name}</span>
      <span
        className={clsx(
          "flex items-center justify-center w-5 h-5 rounded border transition-colors",
          isActive
            ? "bg-principal-300 border-principal-300 text-white"
            : "border-bg-200 bg-bg-50"
        )}
        aria-hidden="true"
      >
        {isActive && <Check className="w-3.5 h-3.5" />}
      </span>
    </>
  ) : (
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
        aria-pressed={isActive}
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
