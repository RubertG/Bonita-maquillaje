"use client"

import { useTransitionRouter } from "next-view-transitions"
import { Cart } from "../common/icons"
import { useCartStore } from "@/stores/cart/cart.store"

interface CartButtonProps {
  variant?: "icon" | "item"
}

export const CartButton = ({ variant = "icon" }: CartButtonProps) => {
  const cartSize = useCartStore(state => state.items.length)
  const router = useTransitionRouter()

  if (variant === "item") {
    return (
      <button
        type="button"
        onClick={() => router.push("/carrito")}
        className="flex items-center justify-between w-full py-2 px-3 text-text-100 font-normal"
      >
        <span>Carrito</span>
        {cartSize > 0 && (
          <span className="bg-red-500 text-xs min-w-[1.25rem] h-5 px-1 font-medium rounded-full flex text-white justify-center items-center">
            {cartSize > 99 ? "99" : cartSize}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/carrito")}
      title="Ir al carrito"
      className="relative block"
    >
      {cartSize > 0 && (
        <span className="absolute -top-2 -right-2.5 bg-red-500 text-xs w-5 h-5 pt-[1px] font-medium rounded-full flex text-white justify-center items-center z-10">
          {cartSize > 99 ? "99" : cartSize}
        </span>
      )}
      <Cart className="stroke-text-100 lg:transition-all lg:hover:stroke-accent-300 lg:hover:scale-110" />
    </button>
  )
}

