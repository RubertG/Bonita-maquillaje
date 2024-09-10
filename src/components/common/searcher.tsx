"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "./icons"
import { useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import clsx from "clsx"

export const Searcher = ({
  className, placeholder
}: {
  className?: string,
  placeholder?: string
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState(searchParams.get("busqueda"))
  const router = useRouter()

  useEffect(() => {
    if (inputRef.current && !searchParams.get("busqueda")) {
      inputRef.current.value = ""
    }
  }, [searchParams.get("busqueda")])

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

export const SearcherClient = ({
  className, placeholder, setSearch, search
}: {
  className?: string,
  placeholder?: string,
  search: string,
  setSearch: (search: string) => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current && search === "") {
      inputRef.current.value = ""
    }
  }, [search])

  const handleSearch = (s: string) => {
    setSearch(s)
  }

  const handleChange = useDebouncedCallback(handleSearch, 350)

  return (
    <form
      className={`flex items-center justify-between w-full bg-bg-50 rounded-lg pr-2.5 gap-1.5 shadow-button ${className} max-w-2xl mx-auto`}>
      <input
        className="w-full rounded-lg pl-3.5 py-2.5 focus:outline-none text-text-200 font-light placeholder:text-gray-400"
        placeholder={placeholder ? placeholder : "Busca el producto que quieres..."}
        name="search"
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
        ref={inputRef}
        type="text" />
      <button
        className="flex items-center justify-center relative"
        disabled={search === ""}
        onClick={() => handleSearch("")}
      >
        <Search className={clsx("stroke-text-200 w-8 transition-opacity", {
          "opacity-0": search !== "",
          "opacity-100": search === ""
        })} />
        <X className={clsx("stroke-text-200 w-8 absolute transition-opacity", {
          "opacity-0": search === "",
          "opacity-100": search !== ""
        })} />
      </button>
    </form>
  )
}
