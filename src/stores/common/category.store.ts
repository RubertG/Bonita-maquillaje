import { getCategories, getPublicCategories } from "@/firebase/services/categories"
import { reorderCategories as reorderCategoriesAction } from "@/app/actions/admin/categories"
import { sortCategories } from "@/lib/category-order"
import { getAuthToken } from "@/lib/auth-token"
import { Category } from "@/types/db/db"
import { create, StateCreator } from "zustand"

interface FetchCategoriesOptions {
  publicOnly?: boolean
}

interface CategoryState {
  categories: Category[]
  loading: boolean
  loadedPublicOnly: boolean | null
  reordering: boolean
  reorderError: string | null

  setLoading: (loading: boolean) => void
  fetchCategories: (options?: FetchCategoriesOptions) => Promise<void>
  hydrateCategories: (categories: Category[], publicOnly: boolean) => void
  deleteCategory: (id: string) => void
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
  reorderCategories: (next: Category[]) => Promise<void>
}

const storeApi: StateCreator<CategoryState> = (set, get) => ({
  categories: [],
  loading: true,
  loadedPublicOnly: null,
  reordering: false,
  reorderError: null,

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
  hydrateCategories: (categories: Category[], publicOnly: boolean) => {
    // `loadedPublicOnly` must be set here too, or `fetchCategories` (which
    // early-returns on `categories.length > 0 && loadedPublicOnly === publicOnly`)
    // refetches what the server already sent.
    // `reorderError` is cleared too: a stale failure banner must not survive a
    // remount and report a state that is no longer true.
    set({
      categories: sortCategories(categories),
      loadedPublicOnly: publicOnly,
      loading: false,
      reorderError: null
    })
  },
  deleteCategory: (id: string) => {
    set({ categories: get().categories.filter(category => category.id !== id) })
  },
  addCategory: (category: Category) => {
    set({ categories: sortCategories([...get().categories, category]) })
  },
  updateCategory: (category: Category) => {
    // `{ ...c, ...category }` is deliberate: it cannot erase a stored `order`
    // because the payload omits the key when unknown.
    set({
      categories: sortCategories(
        get().categories.map(c => c.id === category.id ? { ...c, ...category } : c)
      )
    })
  },
  reorderCategories: async (next: Category[]) => {
    const snapshot = get().categories
    const normalized = next.map((category, index) => ({ ...category, order: index }))

    const orders = normalized
      .filter(category => category.order !== snapshot.find(item => item.id === category.id)?.order)
      .map(({ id, order }) => ({ id, order }))

    set({ categories: normalized, reorderError: null })

    if (orders.length === 0) return

    set({ reordering: true })

    const token = await getAuthToken()
    const result = await reorderCategoriesAction(token, orders)

    if (!result.ok) {
      set({ categories: snapshot, reorderError: result.error })
    }

    set({ reordering: false })
  }
})

export const useStoreCategory = create<CategoryState>()(
  storeApi
)