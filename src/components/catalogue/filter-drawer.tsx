"use client"

import { useEffect, useRef, useCallback } from "react"
import { FilterContent } from "./filter-content"
import { X } from "@/components/common/icons"

interface Props {
  isOpen: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}

export const FilterDrawer = ({ isOpen, onClose, triggerRef }: Props) => {
  const drawerRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const getFocusable = useCallback(() => {
    const drawer = drawerRef.current
    if (!drawer) return []
    return Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== "Tab") return

      const focusable = getFocusable()
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose, getFocusable])

  useEffect(() => {
    if (!isOpen && triggerRef?.current) {
      triggerRef.current.focus()
    }
  }, [isOpen, triggerRef])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        ref={drawerRef}
        className="absolute top-0 left-0 h-full w-full max-w-sm bg-bg-100 shadow-lg p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
      >
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-lg text-text-100">Filtros</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg lg:hover:bg-bg-200 transition-colors"
            aria-label="Cerrar filtros"
          >
            <X className="w-6 h-6 stroke-text-100" />
          </button>
        </header>
        <FilterContent onClose={onClose} />
      </nav>
    </div>
  )
}
