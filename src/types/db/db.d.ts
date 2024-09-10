import { Timestamp } from "firebase/firestore"
import { FileStateItem } from "../admin/admin"

export type Id = string

export interface Tone {
  color: string
  name: string
}

export interface Category {
  id: Id
  name: string
  img: FileStateItem
}

export interface Product {
  id: Id
  name: string
  price: number
  description: string
  stock: number
  tones: Tone[]
  imgs: FileStateItem[]
  category: Id
}

export interface Order {
  id: Id
  name: string
  email: string
  phone: number
  department: string
  city: string
  address: string
  state: boolean
  paymentMethod: string
  products: {
    id: Id
    discountCode?: {
      code: Id
      discount: number
    }
    tone?: Tone
    amount: number
  }[]
  create_at: Timestamp
}

export interface DiscountCode {
  id: Id
  code: string
  discount: number
  expiration: Timestamp
  category: Id
} 