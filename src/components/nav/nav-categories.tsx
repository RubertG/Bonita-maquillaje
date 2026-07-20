"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Cart, Tag, UserCog } from "@/components/common/icons"
import { useCartStore } from "@/stores/cart/cart.store"
import { NavCategory } from "./nav-category-link"
import { MobileMenuItem } from "./mobile-menu"

interface NavCategoriesProps {
  categories: NavCategory[]
  isAdmin: boolean
}

export function NavCategories({ categories, isAdmin }: NavCategoriesProps) {
  const searchParams = useSearchParams()
  const activeId = searchParams?.get("categoria")
  const router = useRouter()
  const cartSize = useCartStore((state) => state.items.length)

  return (
    <>
      {categories.map((category) => (
        <MobileMenuItem
          key={category.id}
          href={`/catalogo?categoria=${encodeURIComponent(category.id)}`}
          icon={<Tag className="w-5 h-5" />}
          isActive={activeId === category.id}
        >
          {category.name}
        </MobileMenuItem>
      ))}
      <MobileMenuItem
        onClick={() => router.push("/carrito")}
        icon={<Cart className="w-5 h-5" />}
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
        <MobileMenuItem className="mt-auto" href="/admin" icon={<UserCog className="w-5 h-5" />}>
          Administración
        </MobileMenuItem>
      )}
    </>
  )
}
