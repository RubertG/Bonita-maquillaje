import { getCategories } from "@/firebase/services/server/categories"
import { verifyAdminSession } from "@/app/actions/admin/auth"
import { Link } from "next-view-transitions"
import Image from "next/image"
import { branch } from "@/fonts/branch/branch"
import { CartButton } from "@/components/catalogue/cart-button"
import { MobileMenu } from "@/components/nav/mobile-menu"
import { NavCategories } from "@/components/nav/nav-categories"
import { NavCategory } from "@/components/nav/nav-category-link"

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
    <nav className="bg-bg-100 lg:bg-bg-transparent lg:backdrop-blur-sm px-4 py-2.5 fixed w-full top-0 left-0 z-[60] border-b border-bg-200">
      <div className="flex items-center max-w-7xl mx-auto">
        <div className="flex-1 flex items-center justify-start gap-4 min-w-0">
          <div>
            <MobileMenu>
              <NavCategories categories={categories} isAdmin={isAdmin} />
            </MobileMenu>
          </div>
        </div>

        <Link
          className="flex-1 flex items-center justify-center gap-1"
          href="/"
        >
          <Image
            width={40}
            height={40}
            src="/logo-2.webp"
            alt="Logo de Bonita Maquillaje"
            className="h-10 object-cover"
          />
          <span className={`hidden lg:block lg:text-2xl ${branch.className}`}>
            Bonita maquillaje
          </span>
        </Link>

        <div className="flex-1 flex items-center justify-end min-w-0">
          <CartButton />
        </div>
      </div>
    </nav>
  )
}
