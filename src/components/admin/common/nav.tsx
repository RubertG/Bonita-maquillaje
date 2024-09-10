'use client'

import { singOutSession } from "@/firebase/services/auth"
import { getCategories } from "@/firebase/services/categories"
import { branch } from "@/fonts/branch/branch"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const links = [
  {
    name: "Productos",
    href: "/admin/productos"
  },
  {
    name: "Categorías",
    href: "/admin/categorias"
  },
  {
    name: "Pedidos",
    href: "/admin/pedidos"
  },
  {
    name: "Ventas",
    href: "/admin/ventas"
  },
  {
    name: "Códigos de descuento",
    href: "/admin/codigos-de-descuento"
  }
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const [firstCategory, setFirstCategory] = useState<string>("")
  const pathname = usePathname()

  useEffect(() => {
    const getFirstCategory = async () => {
      const category = await getCategories()
      setFirstCategory(category[0].id)
    }
    getFirstCategory()
  }, [])

  return (
    <nav
      className="bg-bg-100 lg:bg-bg-transparent lg:backdrop-blur-sm px-4 py-2.5 fixed w-full top-0 left-0 z-30"
    >
      <nav
        className="flex items-center justify-between max-w-7xl mx-auto">
        <Link
          className="flex items-center justify-center gap-1"
          href="/"
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
          className={clsx("text-text-100 font-light text-center entry bg-bg-100 lg:bg-inherit absolute w-full top-14 left-0 lg:static lg:w-auto lg:flex lg:items-center lg:justify-center", {
            "hidden": !open
          })}
          onClick={() => setOpen(false)}
        >
          {
            links.map((link) => {
              const isActive = pathname.startsWith(link.href)

              if (link.href === "/admin/productos") {
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href + "/?categoria=" + firstCategory}
                      className={clsx("block py-2 px-3 lg:py-1 w-full border-b border-bg-200 lg:border-0 lg:hover:bg-bg-300 lg:rounded-lg lg:transition-colors", {
                        "text-accent-300 lg:hover:text-text-100 font-normal": isActive
                      })}>
                      {link.name}
                    </Link>
                  </li>
                )
              }

              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={clsx("block py-2 px-3 lg:py-1 w-full border-b border-bg-200 lg:border-0 lg:hover:bg-bg-300 lg:rounded-lg lg:transition-colors", {
                      "text-accent-300 lg:hover:text-text-100 font-normal": isActive
                    })}>
                    {link.name}
                  </Link>
                </li>
              )
            })
          }
          <li>
            <button
              onClick={async () => {
                await singOutSession()
              }}
              className="block py-2 px-3 lg:py-1 w-full border-b border-bg-200 lg:border-0 lg:hover:bg-bg-200 lg:rounded-lg lg:transition-colors">
              Cerrar sesión
            </button>
          </li>
        </ul>
        <button
          className="flex justify-between items-center gap-[3px] flex-col lg:hidden"
          onClick={() => setOpen(!open)}
        >
          <span className={clsx("h-[2px] w-5 bg-text-100 rounded-lg transition-transform", {
            "translate-y-[5px] -rotate-45": open
          })}></span>
          <span className={clsx("h-[2px] w-5 bg-text-100 rounded-lg transition-transform", {
            "opacity-0": open
          })}></span>
          <span className={clsx("h-[2px] w-5 bg-text-100 rounded-lg transition-transform", {
            "-translate-y-[5px] rotate-45": open
          })}></span>
        </button>
      </nav>
    </nav>
  )
}
