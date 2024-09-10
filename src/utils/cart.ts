import { getProduct } from "@/firebase/services/products"
import { Product } from "@/types/admin/admin"
import { ItemCart } from "@/types/catalogue/cart"

export const setCart = (item: ItemCart) => {
  const cartLocal = localStorage.getItem('cart')

  if (!cartLocal) {
    localStorage.setItem('cart', JSON.stringify([item]))
    return
  }

  let parseCart = JSON.parse(cartLocal) as ItemCart[]

  if (parseCart.find(it => {
    if (it.color) return it.color === item.color && it.id === item.id

    return it.id === item.id
  })) {
    parseCart = parseCart.map(it => it.id === item.id ? { ...it, amount: item.amount } : it)
  } else {
    parseCart.push(item)
  }

  localStorage.setItem('cart', JSON.stringify(parseCart))
}

export const getCart = async () => {
  const cart = localStorage.getItem('cart')

  if (!cart) return []

  const parseCart = JSON.parse(cart) as ItemCart[]
  const productsCart = await Promise.all(parseCart.map(async (item) => {
    const product = await getProduct(item.id)

    if (!product) return null

    const tone = product.tones.find(t => t.color === item.color) || product.tones[0]

    const newProduct: Product = {
      ...product,
      amount: item.amount,
      tone
    }

    return newProduct
  }))

  return productsCart.filter(product => product !== null)
}

export const removeCart = (product: Product) => {
  const cartLocal = localStorage.getItem('cart')

  if (!cartLocal) return

  const parseCart = JSON.parse(cartLocal) as ItemCart[]
  const newCart = parseCart.filter(it => {
    if (product.id === product.id && product.tone?.color && it?.color) {
      return it?.color !== product.tone?.color
    }

    return it.id === product.id
  })
  localStorage.setItem('cart', JSON.stringify(newCart))
}

export const changeCount = (id: string, count: number) => {
  const cartLocal = localStorage.getItem('cart')

  if (!cartLocal) return

  const parseCart = JSON.parse(cartLocal) as ItemCart[]
  const newCart = parseCart.map(it => it.id === id ? { ...it, amount: count } : it)
  localStorage.setItem('cart', JSON.stringify(newCart))
}