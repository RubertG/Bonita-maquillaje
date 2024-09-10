import { branch } from "@/fonts/branch/branch"
import Link from "next/link"
import { Cart } from "../common/icons"

export function Nav() {
  return (
    <nav
      className="bg-bg-100 lg:bg-bg-transparent lg:backdrop-blur-sm px-4 py-2.5 fixed w-full top-0 left-0 z-30"
    >
      <nav
        className="flex items-center justify-between max-w-7xl mx-auto">
        <Link
          className="flex items-center justify-center gap-1"
          href="/catalogo"
        >
          <img
            src="/logo-2.webp"
            alt="Logo de Bonita Maquillaje"
            className="h-10 object-cover" />
          <h1
            className={`text-xl lg:text-2xl ${branch.className}`} >
            Bonita maquillaje
          </h1>
        </Link>
        <ul
          className="text-text-100 font-light bg-bg-100 lg:bg-inherit lg:w-auto flex items-center justify-center"
        >
          <li>
            <Link href="/carrito" title="Ir al carrito">
              <Cart className="stroke-text-100 lg:transition-all lg:hover:stroke-accent-300 lg:hover:scale-110" />
            </Link>
          </li>
        </ul>
      </nav>
    </nav>
  )
}
