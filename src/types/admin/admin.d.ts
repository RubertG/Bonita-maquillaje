import { Product } from "../db/db"

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

export interface ProductsContext {
  products: Product[]
  refreshProducts: () => Promise<void>
  loading: boolean
}