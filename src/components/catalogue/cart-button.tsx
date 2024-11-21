"use client"

import Link from 'next/link'
import { Cart } from '../common/icons'
import { useEffect, useState } from 'react'
import { getCart } from '@/utils/cart'

export const CartButton = () => {
  const [cartSize, setCartSize] = useState(0)

  useEffect(() => {
    getCart().then(cart => setCartSize(cart.length)).catch(() => setCartSize(0))
  }, [])

  return (
    <>
      {cartSize}
      <Link href="/carrito" title="Ir al carrito">
        <Cart className="stroke-text-100 lg:transition-all lg:hover:stroke-accent-300 lg:hover:scale-110" />
      </Link>
    </>
  )
}

