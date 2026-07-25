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
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
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

  const restoreFocus = useCallback(() => {
    const trigger = triggerRef?.current
    if (trigger) {
      trigger.focus()
    } else {
      previousActiveElement.current?.focus()
    }
  }, [triggerRef])

  const handleClose = useCallback(() => {
    onClose()
    restoreFocus()
  }, [onClose, restoreFocus])

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement | null
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

    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key !== "Tab") return

      const focusables = getFocusable()
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, getFocusable, handleClose])

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
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.aside
            key="filter-drawer-panel"
            ref={drawerRef}
            className="absolute top-0 left-0 h-full w-full max-w-sm bg-bg-100 shadow-lg p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
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
                onClick={handleClose}
                className="p-2 rounded-lg lg:hover:bg-bg-200 transition-colors"
                aria-label="Cerrar filtros"
              >
                <X className="w-6 h-6 stroke-text-100" />
              </button>
            </header>
            <FilterContent onClose={handleClose} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
