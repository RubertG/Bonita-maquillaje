import { BackButtonCategory } from "@/components/catalogue/back-button-category"
import { ButtonShare } from "@/components/catalogue/button-share"
import { ButtonsProducts } from "@/components/catalogue/buttons-products"
import { CounterProduct } from "@/components/catalogue/counter-product"
import { ImgsContainer } from "@/components/catalogue/imgs-container"
import { Tones } from "@/components/catalogue/tones"
import { BackButton } from "@/components/common/back-button"
import { getProduct } from "@/firebase/services/products"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

interface Props {
  params: {
    id: string
  },
  searchParams: {
    [key: string]: string | undefined
  }
}

export const generateMetadata = async ({ params: { id } }: Props): Promise<Metadata> => {
  const products = await getProduct(id)

  return {
    title: `${products?.name} - Bonita Maquillaje`,
    description: `${products?.description} - Bonita Maquillaje`
  }
}

export default async function ProductPage({
  params: { id },
  searchParams
}: Props) {
  const product = await getProduct(id)

  if (!product) return notFound()

  return (
    <main
      className="px-4 my-16 xl:px-0 lg:mt-20 max-w-5xl mx-auto"
    >
      <section className="flex items-center gap-3 justify-between">
        <Suspense fallback={(
          <BackButton href="/catalogo" />
        )}>
          <BackButtonCategory />
        </Suspense>
        <p className="text-accent-300 text-xl">${product.price}</p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-4 lg:gap-8 mt-6">
        <ImgsContainer imgs={product.imgs} />
        <aside className="overflow-hidden">
          <header className="flex gap-2 items-center justify-between">
            <h2 className="text-xl text-text-100">
              {product.name}
            </h2>
            <ButtonShare
              url={`https://bonita-maquillaje.com/catalogo/${product.id}`}
              title={`${product.name} - Bonita Maquillaje`}
              text={`¡Te invito a que compres el producto "${product.name}" en Bonita Maquillaje!`}
            />
          </header>

          <p className="text-text-200 mt-3 font-light">
            {product.description}
          </p>

          {
            product.tones?.length > 0 && (
              <>
                <h2 className="text-lg text-text-100 mt-5">
                  Selecciona tonalidad
                </h2>
                <Tones
                  className="mt-3"
                  tones={product.tones}
                  searchParams={searchParams}
                />
              </>
            )
          }

          <h2 className="text-lg text-text-100 mt-5">
            Selecciona la cantidad
          </h2>
          <CounterProduct
            className="mt-3"
            price={product.price}
            searchParams={searchParams}
          />

          <ButtonsProducts
            className="mt-7"
            searchParams={searchParams}
            id={product.id}
          />
        </aside>
      </section>
    </main>
  )
}