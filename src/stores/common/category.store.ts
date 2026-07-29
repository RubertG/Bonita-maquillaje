import { getCategories, getPublicCategories } from "@/firebase/services/categories"
import { Category } from "@/types/db/db"
import { create, StateCreator } from "zustand"

interface FetchCategoriesOptions {
  publicOnly?: boolean
}

interface CategoryState {
  categories: Category[]
  loading: boolean
  loadedPublicOnly: boolean | null

  setLoading: (loading: boolean) => void
  fetchCategories: (options?: FetchCategoriesOptions) => Promise<void>
  deleteCategory: (id: string) => void
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
}

const storeApi: StateCreator<CategoryState> = (set, get) => ({
  categories: [],
  loading: true,
  loadedPublicOnly: null,

  setLoading: (loading: boolean) => set({ loading }),
  fetchCategories: async (options = {}) => {
    const { publicOnly = false } = options
    const { categories, loadedPublicOnly } = get()

    if (categories.length > 0 && loadedPublicOnly === publicOnly) return

    get().setLoading(true)
    const newCategories = publicOnly
      ? await getPublicCategories()
      : await getCategories()

    if (!newCategories) {
      get().setLoading(false)
      return
    }

    set({ categories: newCategories, loadedPublicOnly: publicOnly })
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