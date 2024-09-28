import { Order } from "@/types/db/db"
import { create, StateCreator } from "zustand"

interface OrdersState {
  orders: Order[]
  loading: boolean

  setLoading: (loading: boolean) => void
  // fetchProducts: () => Promise<void>
  // deleteProduct: (id: string) => void
  // addProduct: (product: Product) => void
  // updateProduct: (product: Product) => void
}

const storeApi: StateCreator<OrdersState> = (set) => ({
  orders: [],
  loading: true,

  setLoading: (loading: boolean) => set({ loading })
})

export const useStoreOrders = create<OrdersState>()(
  storeApi
)