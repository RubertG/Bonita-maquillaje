"use client"

import { Cart } from '../common/icons'
import { useEffect, useState } from 'react'
import { getCart } from '@/utils/cart'
import { useRouter } from 'next/navigation'

export const CartButton = () => {
  const [cartSize, setCartSize] = useState(0)
  const router = useRouter()

  useEffect(() => {
    getCart().then(cart => setCartSize(cart.length)).catch(() => setCartSize(0))
  }, [])

  return (
    <button
      onClick={() => router.push("/carrito")}
      title="Ir al carrito"
      className='relative block'
    >
      {
        cartSize > 0 &&
        <p className='absolute -top-2 -right-2.5 bg-red-500 text-xs w-5 h-5 pt-[1px] font-medium rounded-full flex text-white justify-center items-center z-10'>
          {cartSize > 99 ? "99" : cartSize}
        </p>
      }
      <Cart className="stroke-text-100 lg:transition-all lg:hover:stroke-accent-300 lg:hover:scale-110" />
    </button>
  )
}

