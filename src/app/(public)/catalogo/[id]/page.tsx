import { Suspense } from "react"

import { BackButtonCategory } from "@/components/catalogue/back-button-category"
import { ButtonShare } from "@/components/catalogue/button-share"
import { ButtonsProducts } from "@/components/catalogue/buttons-products"
import { CounterProduct } from "@/components/catalogue/counter-product"
import { ImgsContainer } from "@/components/catalogue/imgs-container"
import { Tones } from "@/components/catalogue/tones"
import { BackButton } from "@/components/common/back-button"
import { getProduct, getProducts } from "@/firebase/services/server/products"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export async function generateStaticParams() {
  try {
    const products = await getProducts()
    return products.slice(0, 20).map(({ id }) => ({ id }))
  } catch {
    return []
  }
}

export const generateMetadata = async ({
  params
}: Props): Promise<Metadata> => {
  const { id } = await params
  const product = await getProduct(id)

  return {
    title: product
      ? `${product.name} - Bonita Maquillaje`
      : "Producto - Bonita Maquillaje",
    description: product
      ? `${product.description} - Bonita Maquillaje`
      : "Catálogo de productos de Bonita Maquillaje."
  }
}

export default async function ProductPage({
  params,
  searchParams
}: Props) {
  const { id } = await params
  const searchParamsResolved = await searchParams
  const product = await getProduct(id)

  if (!product) return notFound()

  return (
    <main className="px-4 my-16 xl:px-0 lg:mt-20 max-w-6xl mx-auto">
      <section className="flex items-center gap-3 justify-between">
        <Suspense fallback={<BackButton href="/catalogo/productos" />}>
          <BackButtonCategory />
        </Suspense>
        <p className="text-accent-300 text-xl">${product.price}</p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-4 lg:gap-8 mt-6">
        <ImgsContainer imgs={product.imgs} />
        <aside className="overflow-hidden">
          <header className="flex gap-2 items-center justify-between">
            <h2 className="text-xl text-text-100">{product.name}</h2>
            <ButtonShare
              url={`https://bonita-maquillaje.com/catalogo/${product.id}`}
              title={`${product.name} - Bonita Maquillaje`}
              text={`¡Te invito a que compres el producto "${product.name}" en Bonita Maquillaje!`}
            />
          </header>

          <p className="text-text-200 mt-3 font-light whitespace-pre-wrap leading-snug">
            {product.description}
          </p>

          {product.tones?.length > 0 && (
            <>
              <h2 className="text-lg text-text-100 mt-5">
                Selecciona tonalidad
              </h2>
              <Tones
                className="mt-3"
                tones={product.tones}
                searchParams={searchParamsResolved}
              />
            </>
          )}

          <h2 className="text-lg text-text-100 mt-5">
            Selecciona la cantidad
          </h2>
          <CounterProduct
            className="mt-3"
            price={product.price}
            searchParams={searchParamsResolved}
          />

          <ButtonsProducts
            className="mt-7"
            searchParams={searchParamsResolved}
            id={product.id}
          />
        </aside>
      </section>
    </main>
  )
}
