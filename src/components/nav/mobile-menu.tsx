"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { motion, AnimatePresence, useReducedMotion, type Transition } from "motion/react"
import { Menu, X } from "@/components/common/icons"
import { Category } from "@/types/db/db"

export type NavCategory = Pick<Category, "id" | "name">

interface MobileMenuProps {
  categories: NavCategory[]
  isAdmin: boolean
  children: ReactNode
}

interface MobileMenuItemProps {
  children: ReactNode
  className?: string
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const panelVariants = {
  hidden: { x: "-100%" },
  visible: { x: "0%" }
}

const listVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export function MobileMenuItem({ children, className }: MobileMenuItemProps) {
  const reduced = useReducedMotion()
  return (
    <motion.li
      variants={itemVariants}
      transition={reduced ? { duration: 0 } : undefined}
      className={className}
    >
      {children}
    </motion.li>
  )
}

export function MobileMenu({ children }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  const menuRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setIsOpen(false), [])

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

    const menu = menuRef.current
    if (!menu) return

    const focusableSelector =
      "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
    const focusables = Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector))
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    first?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
        toggleRef.current?.focus()
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
  }, [isOpen, close])

  const transition: Transition = reducedMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 300, damping: 30 }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="flex items-center justify-center p-2 text-text-100 lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="mobile-menu-backdrop"
              className="fixed inset-0 z-40 bg-black/30"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
              onClick={close}
            />
            <motion.aside
              key="mobile-menu-panel"
              id="mobile-menu"
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              className="fixed top-0 left-0 h-full w-3/4 max-w-xs bg-bg-100 z-50 flex flex-col p-4"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={transition}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar menú"
                className="self-end mb-4 p-2 text-text-100"
              >
                <X className="w-6 h-6" />
              </button>
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                transition={reducedMotion ? { staggerChildren: 0 } : { staggerChildren: 0.05 }}
                className="flex-1 flex flex-col gap-6 overflow-y-auto"
              >
                {children}
              </motion.ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
