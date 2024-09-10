import { Header } from "@/components/linktree/header"
import { SocialButtonContainer } from "@/components/linktree/social-button-container"
import { branch } from "@/fonts/branch/branch"

function LinkstreePage() {
  return (
    <main
      className={`${branch.className} bg-gradient-principal`}
    >
      <section
        className="h-dvh flex flex-col items-center md:justify-center m-auto mx-7 py-5 lg:mx-auto max-w-4xl"
      >
        <Header className="lg:mt-0" />
        <SocialButtonContainer className="mt-7 lg:mt-5" />
        <p
          className="text-text-200 mt-7 max-w-2xl lg:text-lg"
        >
          Somos una tienda virtual y física en la ciudad de Cúcuta. Te ofrecemos los productos más TOP de marcas Colombianas en maquillaje, skincare y accesorios.
        </p>
      </section>
    </main>
  )
}

export default LinkstreePage