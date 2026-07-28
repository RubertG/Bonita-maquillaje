import { getCategories, getPublicCategories } from "@/firebase/services/categories"
import { Category } from "@/types/db/db"
import { create, StateCreator } from "zustand"

interface FetchCategoriesOptions {
  publicOnly?: boolean
}

interface CategoryState {
  categories: Category[]
  loading: boolean

  setLoading: (loading: boolean) => void
  fetchCategories: (options?: FetchCategoriesOptions) => Promise<void>
  deleteCategory: (id: string) => void
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
}

const storeApi: StateCreator<CategoryState> = (set, get) => ({
  categories: [],
  loading: true,

  setLoading: (loading: boolean) => set({ loading }),
  fetchCategories: async (options = {}) => {
    if (get().categories.length > 0) return

    const { publicOnly = false } = options
    get().setLoading(true)
    const categories = publicOnly
      ? await getPublicCategories()
      : await getCategories()

    if (!categories) return

    set({ categories })
    get().setLoading(false)
  },
  deleteCategory: (id: string) => {
    set({ categories: get().categories.filter(category => category.id !== id) })
  },
  addCategory: (category: Category) => {
    set({ categories: [...get().categories, category] })
  },
  updateCategory: (category: Category) => {
    set({ categories: get().categories.map(c => c.id === category.id ? category : c) })
  }
})

export const useStoreCategory = create<CategoryState>()(
  storeApi
)