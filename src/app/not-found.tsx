import { H1 } from "@/components/common/h1"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex flex-col min-h-dvh items-center justify-center py-10 px-4">
      <H1>No se encontró la página</H1>
      <Link
        href={"/catalogo"}
        className="text-text-200 font-light cursor-pointer lg:hover:text-text-50 lg:transition-colors mt-5 text-lg lg:hover:underline"
      >
        Volver a la tienda
      </Link>
    </main>
  )
} 