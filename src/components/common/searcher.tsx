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
  const [search, setSearch] = useState(searchParams.get("busqueda"))
  const router = useRouter()

  const busquedaValue = searchParams.get("busqueda")

  useEffect(() => {
    if (inputRef.current && !busquedaValue) {
      inputRef.current.value = ""
    }
  }, [busquedaValue])

  const handleSearch = () => {
    const url = new URLSearchParams(searchParams.toString())

    if (search) {
      url.set("busqueda", search)
    } else {
      url.delete("busqueda")
    }

    router.replace(url.toString() ? `${pathname}?${url.toString()}` : pathname, { scroll: false })
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
