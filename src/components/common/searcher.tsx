"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "./icons"
import { useEffect, useState, useRef } from "react"
import { useDebouncedCallback } from "use-debounce"

interface Props {
  className?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export const Searcher = ({
  className, placeholder, value: controlledValue, onChange
}: Props) => {
  const isControlled = controlledValue !== undefined
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [search, setSearch] = useState(() => {
    if (isControlled) return controlledValue ?? ""
    return searchParams.get("busqueda") || ""
  })

  const busquedaValue = searchParams.get("busqueda") || ""

  useEffect(() => {
    if (isControlled) {
      setSearch(controlledValue ?? "")
    } else {
      setSearch(busquedaValue)
    }
  }, [busquedaValue, controlledValue, isControlled])

  const handleUrlSearch = useDebouncedCallback(() => {
    const url = new URLSearchParams(searchParams.toString())

    if (search) {
      url.set("busqueda", search)
    } else {
      url.delete("busqueda")
    }

    router.replace(url.toString() ? `${pathname}?${url.toString()}` : pathname, { scroll: false })
  }, 350)

  const handleControlledSearch = useDebouncedCallback((value: string) => {
    onChange?.(value)
  }, 350)

  const handleChange = (value: string) => {
    setSearch(value)
    if (isControlled) {
      handleControlledSearch(value)
    } else {
      handleUrlSearch()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (isControlled) {
          handleControlledSearch.flush()
        } else {
          handleUrlSearch.flush()
        }
      }}
      className={`flex items-center justify-between w-full bg-bg-50 rounded-lg pr-2.5 gap-1.5 shadow-button ${className} max-w-2xl mx-auto`}>
      <label htmlFor="catalog-search" className="sr-only">
        Buscar productos
      </label>
      <input
        id="catalog-search"
        className="w-full rounded-lg pl-3.5 py-2.5 focus:outline-none text-text-200 font-light placeholder:text-gray-400"
        placeholder={placeholder ? placeholder : "Busca el producto que quieres..."}
        name="search"
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
        ref={inputRef}
        value={search}
        type="text"
      />
      <button type="submit" aria-label="Buscar">
        <Search className="stroke-text-200 w-8" />
      </button>
    </form>
  )
}
