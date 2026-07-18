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
        <CartButton variant="item" />
      </MobileMenuItem>
      {isAdmin && (
        <MobileMenuItem className="mt-auto">
          <AdminNavLink />
        </MobileMenuItem>
      )}
    </>
  )
}
