"use client"

import { Search, X } from "./icons"
import { useEffect, useRef } from "react"
import { useDebouncedCallback } from "use-debounce"
import clsx from "clsx"

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
