import { Product as ProductDB, Tone } from "../db/db"

export interface InputsOrders {
  name: string
  department: string
  city: string
  address: string
  email: string
  paymentMethod: string
  phone: string
}

export interface Product extends ProductDB {
  amount: number
  discountCode?: {
    code: string
    discount: number
  }
  tone?: Tone
}
