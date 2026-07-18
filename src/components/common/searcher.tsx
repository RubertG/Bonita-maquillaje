"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "./icons"
import { useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"

export const Searcher = ({
  className, placeholder
}: {
  className?: string,
  placeholder?: string
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const busqueda = searchParams.get("busqueda")
  const [search, setSearch] = useState(busqueda)
  const router = useRouter()

  useEffect(() => {
    if (inputRef.current && !busqueda) {
      inputRef.current.value = ""
    }
  }, [busqueda])

  const handleSearch = () => {
    const categoriaValue = searchParams.get("categoria")

    const url = new URLSearchParams({
      ...((search) && { busqueda: search }),
      ...((categoriaValue) && { categoria: categoriaValue })
    })

    router.replace(`${pathname}?${url.toString()}`)
  }

  const handleChange = useDebouncedCallback(handleSearch, 350)


  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSearch()
      }}
      onChange={handleChange}
      className={`flex items-center justify-between w-full bg-bg-50 rounded-lg pr-2.5 gap-1.5 shadow-button ${className} max-w-2xl mx-auto`}>
      <input
        className="w-full rounded-lg pl-3.5 py-2.5 focus:outline-none text-text-200 font-light placeholder:text-gray-400"
        placeholder={placeholder ? placeholder : "Busca el producto que quieres..."}
        name="search"
        autoComplete="off"
        onChange={(e) => setSearch(e.target.value)}
        ref={inputRef}
        defaultValue={searchParams.get("busqueda") || ""}
        type="text" />
      <button>
        <Search className="stroke-text-200 w-8" />
      </button>
    </form>
  )
}
