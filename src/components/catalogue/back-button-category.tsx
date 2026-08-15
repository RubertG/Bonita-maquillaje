"use client"

import { useSearchParams } from "next/navigation"
import { BackButton } from "../common/back-button"

interface Props {
  href?: string
}

export const BackButtonCategory = ({ href = "/catalogo/productos" }: Props) => {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("categoria")

  const backHref = categoryId
    ? `${href}?categoria=${encodeURIComponent(categoryId)}`
    : href

  return <BackButton href={backHref} />
}
