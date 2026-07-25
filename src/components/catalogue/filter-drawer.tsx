"use client"

import { useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { FilterContent } from "./filter-content"
import { X } from "@/components/common/icons"

interface Props {
  isOpen: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const panelVariants = {
  hidden: { x: "-100%" },
  visible: { x: "0%" }
}

export const FilterDrawer = ({ isOpen, onClose, triggerRef }: Props) => {
  const drawerRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useReducedMotion()

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
    if (isOpen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const drawer = drawerRef.current
    if (!drawer) return

    closeButtonRef.current?.focus()

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const focusables = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector))
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        triggerRef?.current?.focus()
        return
      }

      if (event.key === "Tab" && focusables.length > 0) {
        const active = document.activeElement as HTMLElement | null
        if (event.shiftKey && active === first) {
          last?.focus()
          event.preventDefault()
        } else if (!event.shiftKey && active === last) {
          first?.focus()
          event.preventDefault()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose, getFocusable, triggerRef])

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: "easeOut" as const }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <motion.div
            key="filter-drawer-backdrop"
            className="absolute inset-0 bg-black/30"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transition}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.nav
            key="filter-drawer-panel"
            ref={drawerRef}
            className="absolute top-0 left-0 h-full w-full max-w-sm bg-bg-100 shadow-lg p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transition}
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
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  )
}
