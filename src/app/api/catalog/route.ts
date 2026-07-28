import { NextRequest, NextResponse } from "next/server"

import { ALL_CATEGORY } from "@/consts/admin/orders"
import { getCategories } from "@/firebase/services/server/categories"
import { getProducts } from "@/firebase/services/server/products"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get("category")
  const search = searchParams.get("search") ?? undefined

  const [categories, products] = await Promise.all([
    getCategories({ publicOnly: true }),
    getProducts({
      category: category && category !== ALL_CATEGORY ? category : undefined,
      search: search || undefined
    })
  ])

  return NextResponse.json({ categories, products })
}
