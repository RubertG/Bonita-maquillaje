"use client"

import clsx from "clsx"
import { Button } from "../common/button"
import { Gift, SaveCart, Spinner } from "../common/icons"
import { useForm } from "@/hooks/common/use-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { ItemCart } from "@/types/catalogue/cart"
import { setCart } from "@/utils/cart"
import { useRouter } from "next/navigation"

export const ButtonsProducts = ({
  className,
  searchParams,
  id
}: {
  className?: string
  searchParams: {
    [key: string]: string | undefined
  },
  id: string
}) => {
  const [inCart, setInCart] = useState(false)
  const router = useRouter()
  const { loading, handleSubmit } = useForm({
    schema: z.object({}),
    actionSubmit: async () => {
      setCart({
        id,
        ...(searchParams.color && { color: searchParams.color }),
        amount: searchParams.cantidad ? parseInt(searchParams.cantidad) : 1
      })
      router.push(`/carrito/${id}${searchParams.color ? `?color=%23${searchParams.color.slice(1)}` : ""}`)
    }
  })

  useEffect(() => {
    if (localStorage.getItem("cart")) {
      const cartLocal = localStorage.getItem("cart")

      if (!cartLocal) return

      const cart = JSON.parse(cartLocal) as ItemCart[]
      setInCart(cart.some((item) => {
        if (item.color) return item.id === id && item.color === searchParams.color

        return item.id === id
      }))
    }
  }, [searchParams.color])

  const handleAddCart = () => {
    setCart({
      id,
      ...(searchParams.color && { color: searchParams.color }),
      amount: searchParams.cantidad ? parseInt(searchParams.cantidad) : 1
    })
    setInCart(true)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-3 gap-y-4 lg:gap-5 flex-wrap ${className}`}>
      <Button>
        <Gift className="stroke-text-100" />
        <Spinner className={clsx("w-5 h-5 absolute opacity-0 transition-opacity", { "opacity-100": loading })} />
        <p className={clsx("transition-opacity", { "opacity-0": loading })}>
          Hacer pedido
        </p>
      </Button>
      <button
        className={clsx("relative inline-flex items-center justify-center rounded-lg text-text-200 gap-2 text-center", {
          "lg:hover:text-principal-300 group": !inCart
        })}
        type="button"
        onClick={handleAddCart}
        disabled={inCart}
      >
        <SaveCart className="stroke-text-200 lg:group-hover:stroke-principal-300 lg:transition-colors" />
        {inCart ? "En el carrito" : "Añadir al carrito"}
      </button>
    </form>
  )
}