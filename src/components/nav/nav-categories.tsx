"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Cart, Home, Tag, UserCog } from "@/components/common/icons"
import { useCartStore } from "@/stores/cart/cart.store"
import { NavCategory } from "./nav-category-link"
import { MobileMenuItem, MobileMenuSection } from "./mobile-menu"

interface NavCategoriesProps {
  categories: NavCategory[]
  isAdmin: boolean
}

export function NavCategories({ categories, isAdmin }: NavCategoriesProps) {
  const searchParams = useSearchParams()
  const activeId = searchParams?.getAll("categoria")
  const router = useRouter()
  const pathname = usePathname()
  const cartSize = useCartStore((state) => state.items.length)

  return (
    <>
      <MobileMenuItem
        onClick={() => router.push("/catalogo/productos")}
        icon={<Home className="w-5 h-5" />}
        isActive={pathname === "/catalogo/productos" && activeId.length === 0}
      >
        <span className="flex items-center gap-2">
          Inicio
        </span>
      </MobileMenuItem>
      <MobileMenuItem
        onClick={() => router.push("/carrito")}
        icon={<Cart className="w-5 h-5" />}
        isActive={pathname === "/carrito"}
      >
        <span className="flex items-center gap-2">
          Carrito
          {cartSize > 0 && (
            <span className="bg-red-500 text-xs min-w-[1.25rem] h-5 px-1 font-medium rounded-full flex text-white justify-center items-center">
              {cartSize > 99 ? "99" : cartSize}
            </span>
          )}
        </span>
      </MobileMenuItem>
      {isAdmin && (
        <MobileMenuItem href="/admin" icon={<UserCog className="w-5 h-5" />}>
          Administración
        </MobileMenuItem>
      )}
      <MobileMenuSection title="Categorías">
        {categories.map((category) => (
          <MobileMenuItem
            key={category.id}
            href={`/catalogo/productos?categoria=${encodeURIComponent(category.id)}`}
            icon={<Tag className="w-5 h-5" />}
            isActive={activeId.includes(category.id)}
          >
            {category.name}
          </MobileMenuItem>
        ))}
      </MobileMenuSection>
    </>
  )
}
