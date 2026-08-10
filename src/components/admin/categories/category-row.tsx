"use client"

import { ArrowDown, ArrowUp, Delete, Edit, Selector } from "@/components/common/icons"
import { PopupDelete } from "../common/popup-delete"
import { useCategoryDelete } from "@/hooks/admin/category/use-category-delete"
import { Category } from "@/types/db/db"
import { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"
import Image from "next/image"
import Link from "next/link"
import { CSSProperties } from "react"

interface Props {
  category: Category
  position: number
  total: number
  disabled?: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  handleAttributes?: DraggableAttributes
  handleListeners?: DraggableSyntheticListeners
  innerRef?: (node: HTMLElement | null) => void
  style?: CSSProperties
}

export const CategoryRow = ({
  category,
  position,
  total,
  disabled = false,
  onMoveUp,
  onMoveDown,
  handleAttributes,
  handleListeners,
  innerRef,
  style
}: Props) => {
  const { loading, popup, error, handlePopup, handleDelete } = useCategoryDelete(category)

  return (
    <li
      ref={innerRef}
      style={style}
      className="rounded-lg bg-bg-50 shadow-button p-2 sm:p-2.5 lg:hover:bg-bg-100 lg:transition-colors motion-reduce:transition-none"
    >
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
          <button
            {...handleAttributes}
            {...handleListeners}
            type="button"
            aria-label={`Reordenar ${category.name}`}
            className="hidden sm:block p-2.5 shrink-0 cursor-grab active:cursor-grabbing touch-none focus-visible:outline-principal-200"
          >
            <Selector className="stroke-text-300" />
          </button>
          <span className="w-5 sm:w-6 shrink-0 text-center tabular-nums text-xs sm:text-sm font-light text-text-300">
            {position}
          </span>
          <Image
            width={48}
            height={48}
            loading="lazy"
            src={category.img.url?.trim() || "/logo.webp"}
            alt=""
            className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 object-cover aspect-square rounded-lg"
          />
          <p className="flex-1 min-w-0 truncate font-light text-text-200">{category.name}</p>
          {
            category.isStagingOnly && (
              <span className="hidden sm:inline-block shrink-0 rounded px-1.5 py-0.5 bg-accent-200 text-[10px] font-light text-accent-300">
                Solo staging
              </span>
            )
          }
        </div>
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={disabled || position === 1}
            aria-label={`Subir ${category.name}`}
            className="p-2.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-principal-200"
          >
            <ArrowUp className="stroke-text-300 lg:hover:stroke-accent-300 lg:transition-colors" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={disabled || position === total}
            aria-label={`Bajar ${category.name}`}
            className="p-2.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-principal-200"
          >
            <ArrowDown className="stroke-text-300 lg:hover:stroke-accent-300 lg:transition-colors" />
          </button>
          <Link
            href={`?categoria=${category.id}`}
            aria-label={`Editar ${category.name}`}
            className="p-2.5 shrink-0 block focus-visible:outline-principal-200"
          >
            <Edit className="stroke-text-300 lg:hover:stroke-accent-300 lg:transition-colors" />
          </Link>
          <button
            type="button"
            onClick={handlePopup}
            aria-label={`Borrar ${category.name}`}
            className="p-2.5 shrink-0 focus-visible:outline-principal-200"
          >
            <Delete className="stroke-text-300 lg:hover:stroke-accent-300 lg:transition-colors" />
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 font-light text-sm mt-2">{error}</p>}
      {
        popup && (
          <PopupDelete
            title="¿Deseas borrar esta categoría?"
            handleDelete={handleDelete}
            handlePopup={handlePopup}
            loading={loading}
          />
        )
      }
    </li>
  )
}
