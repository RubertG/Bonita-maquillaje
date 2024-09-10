import { ButtonShare } from "@/components/catalogue/button-share"
import { ButtonsProducts } from "@/components/catalogue/buttons-products"
import { CounterProduct } from "@/components/catalogue/counter-product"
import { ImgsContainerSkeleton } from "@/components/catalogue/imgs-container-skeleton"
import { BackButton } from "@/components/common/back-button"
import Skeleton from "react-loading-skeleton"

export default function Loading() {
  return (
    <main
      className="px-4 my-16 xl:px-0 lg:mt-20 max-w-5xl mx-auto"
    >
      <section className="flex items-center gap-3 justify-between">
        <BackButton href="/catalogo" />
        <p className="text-accent-300 text-xl block w-20 h-6"><Skeleton className="block w-full h-full" /></p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-4 lg:gap-8 mt-6">
        <ImgsContainerSkeleton />
        <aside className="overflow-hidden">
          <header className="flex gap-2 items-center justify-between">
            <h2 className="text-xl text-text-100">
              <Skeleton />
            </h2>
            <ButtonShare
              url={`https://bonita-maquillaje.com/catalogo`}
              title={`Bonita Maquillaje`}
              text={`¡Te invito a que compres en Bonita Maquillaje!`}
            />
          </header>

          <p className="text-text-200 mt-3 font-light">
            <Skeleton count={5} />
          </p>

          <h2 className="text-lg text-text-100 mt-5">
            Selecciona la cantidad
          </h2>
          <CounterProduct
            className="mt-3"
            price={0}
            searchParams={{}}
          />

          <ButtonsProducts 
            className="mt-7"
            searchParams={{}}
            id="loading"
          />
        </aside>
      </section>
    </main>
  )
}