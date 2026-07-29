import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { Order, Product as ProductDB, Tone } from "../db/db"

export interface FileStateItem {
  name: string
  url: string
  size: number
}

export interface CategoryInputs {
  name: string
  isStagingOnly: boolean
}

export interface BannerImage extends FileStateItem {
  width: number
  height: number
}

export interface BannerInputs {
  alt: string
}

export interface Inputs {
  name: string
  description: string
  price: number
  stock: number
  category: string
  offerPrice?: number | null
  isBestSeller?: boolean
  isNew?: boolean
}

export interface InputsOrders {
  name: string,
  department: string,
  city: string,
  address: string,
  email: string,
  paymentMethod: string,
  phone: string
}

export interface ProductsContext {
  products: ProductDB[]
  refreshProducts: () => Promise<void>
  loading: boolean
}

export interface OrdersManagementStorage {
  orders: Order[] | undefined
  loading: boolean
  lastVisible: QueryDocumentSnapshot<DocumentData, DocumentData>
  hasNext: boolean
}

export interface Product extends ProductDB {
  amount: number
  discountCode?: {
    code: Id
    discount: number
  }
  tone?: Tone
}