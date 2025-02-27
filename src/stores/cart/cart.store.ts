import { getProduct } from "@/firebase/services/products"
import { Product } from "@/types/admin/admin"
import { ItemCart } from "@/types/catalogue/cart"
import { create, StateCreator } from "zustand"
import { persist } from "zustand/middleware"

interface CartState {
  items: ItemCart[]

  addItem: (item: ItemCart) => void
  updateCart: (cart: Product[]) => void
  changeCount: (id: string, count: number) => void
  getCart: () => Promise<Product[]>
}

const cartStore: StateCreator<CartState> = (set, get) => ({
  items: [],

  addItem: (item) => {
    const cart = get().items
    const itemExists = cart.findIndex(it => it.id === item.id && it?.color === item?.color)

    if (itemExists !== -1) {
      cart[itemExists].amount += item.amount
      set({ items: cart })
      
      return
    }

    set({ items: [...cart, item] })
  },
  updateCart: (p) => {
    const newCart: ItemCart[] = p.map((product) => ({
      id: product.id,
      color: product.tone?.color,
      amount: product.amount
    }))

    set({ items: newCart })
  },
  changeCount: (id, count) => set({ items: get().items.map(it => it.id === id ? { ...it, amount: count } : it) }),

  getCart: async () => {
    const cartLocal = get().items

    const productsCart = await Promise.all(cartLocal.map(async (item) => {
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
})

export const useCartStore = create<CartState>()(
  persist(
    cartStore,
    {
      name: 'cart'
    }
  )
)