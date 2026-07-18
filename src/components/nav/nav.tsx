import { getCategories } from "@/firebase/services/server/categories"
import { verifyAdminSession } from "@/app/actions/admin/auth"
import { Link } from "next-view-transitions"
import Image from "next/image"
import { branch } from "@/fonts/branch/branch"
import { CartButton } from "@/components/catalogue/cart-button"
import { MobileMenu } from "@/components/nav/mobile-menu"
import { NavCategories } from "@/components/nav/nav-categories"
import { NavCategoryLink, NavCategory } from "@/components/nav/nav-category-link"
import { AdminNavLink } from "@/components/nav/admin-nav-link"

async function fetchNavData(): Promise<{ categories: NavCategory[]; isAdmin: boolean }> {
  try {
    const [categoriesResult, adminResult] = await Promise.all([
      getCategories(),
      verifyAdminSession()
    ])
    return {
      categories: categoriesResult.map((category) => ({
        id: category.id,
        name: category.name
      })),
      isAdmin: adminResult.ok
    }
  } catch {
    return { categories: [], isAdmin: false }
  }
}

export async function Nav() {
  const { categories, isAdmin } = await fetchNavData()

  return (
    <nav className="bg-bg-100 lg:bg-bg-transparent lg:backdrop-blur-sm px-4 py-2.5 fixed w-full top-0 left-0 z-30">
      <div className="flex items-center max-w-7xl mx-auto">
        <div className="flex-1 flex items-center justify-start">
          <Link
            className="hidden lg:flex items-center justify-center gap-1"
            href="/"
          >
            <Image
              width={40}
              height={40}
              src="/logo-2.webp"
              alt="Logo de Bonita Maquillaje"
              className="h-10 object-cover"
            />
            <h1 className={`text-xl lg:text-2xl ${branch.className}`}>
              Bonita maquillaje
            </h1>
          </Link>
        </div>

        <ul className="hidden lg:flex flex-1 items-center justify-center gap-6 text-text-100 font-normal">
          {categories.map((category) => (
            <li key={category.id}>
              <NavCategoryLink category={category} />
            </li>
          ))}
          {isAdmin && (
            <li>
              <AdminNavLink />
            </li>
          )}
        </ul>

        <div className="flex-1 flex items-center justify-end gap-4">
          <div className="lg:hidden">
            <MobileMenu categories={categories} isAdmin={isAdmin}>
              <NavCategories categories={categories} isAdmin={isAdmin} />
            </MobileMenu>
          </div>
          <CartButton />
        </div>
      </div>
    </nav>
  )
}
