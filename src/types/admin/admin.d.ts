import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { Params } from "next/dist/shared/lib/router/utils/route-matcher"
import { Order, Product as ProductDB, Tone } from "../db/db"

export interface FileStateItem {
  name: string
  url: string
  size: number
}

export interface CategoryInputs {
  name: string
}

export interface Inputs {
  name: string
  description: string
  price: string
  stock: string
  category: string
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
  refreshProducts: (category: string) => Promise<void>
  loading: boolean
  searchParams: Params
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