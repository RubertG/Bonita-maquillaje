import { useCartStore } from "@/stores/cart/cart.store"
import { useTransitionRouter } from "next-view-transitions"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export const usePurchaseReminder = (delay = 4000) => {
  const [show, setShow] = useState(false)
  const cartSize = useCartStore(state => state.items.length)
  const router = useTransitionRouter()
  const hasShown = useRef(false)

  useEffect(() => {
    if (hasShown.current) return

    const timer = setTimeout(() => {
      setShow(true)
      hasShown.current = true
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!show) return

    handleMessage()
  }, [show])

  const handleMessage = () => {
    if (cartSize > 0) {
      toast("¡No olvides completar tu compra! ❤️", {
        action: (
          <button
            onClick={() => router.push("/carrito")}
            className="bg-accent-200 text-text-200 rounded-lg px-3 py-1.5 w-full lg:hover:bg-principal-100 lg:transition-colors"
          >
            Ir al carrito
          </button>
        )
      })
    } else {
      toast(
        <p className="flex flex-col items-center justify-center">
          <span className="font-bold text-accent-300 !text-lg">¡Aprovecha y compra ya!</span>
          ✨ Los mejores productos están aquí ✨
        </p>
      )
    }
  }
}