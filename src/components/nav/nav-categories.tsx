import { CartButton } from "@/components/catalogue/cart-button"
import { NavCategoryLink, NavCategory } from "./nav-category-link"
import { AdminNavLink } from "./admin-nav-link"
import { MobileMenuItem } from "./mobile-menu"

interface NavCategoriesProps {
  categories: NavCategory[]
  isAdmin: boolean
}

export function NavCategories({ categories, isAdmin }: NavCategoriesProps) {
  return (
    <>
      {categories.map((category) => (
        <MobileMenuItem key={category.id}>
          <NavCategoryLink category={category} />
        </MobileMenuItem>
      ))}
      <MobileMenuItem>
        <div className="flex items-center gap-3 py-2 px-3 text-text-100 font-normal hover:text-principal-300 hover:scale-105 transition-all duration-200 origin-left">
          <CartButton />
          <span>Carrito</span>
        </div>
      </MobileMenuItem>
      {isAdmin && (
        <MobileMenuItem className="mt-auto">
          <AdminNavLink />
        </MobileMenuItem>
      )}
    </>
  )
}
