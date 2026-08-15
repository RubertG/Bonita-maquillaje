"use client"

import { Search } from "./icons"

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export const Searcher = ({ value, onChange, className, placeholder }: Props) => {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
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
        onChange={(e) => onChange(e.target.value)}
        value={value}
        type="text"
      />
      <button type="submit" aria-label="Buscar">
        <Search className="stroke-text-200 w-8" />
      </button>
    </form>
  )
}
