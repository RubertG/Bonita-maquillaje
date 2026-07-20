"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { motion, AnimatePresence, useReducedMotion, type Transition } from "motion/react"
import Link from "next/link"
import { ChevronRight, Menu, X } from "@/components/common/icons"
import { branch } from "@/fonts/branch/branch"

interface MobileMenuProps {
  children: ReactNode
}

interface MobileMenuItemProps {
  children: ReactNode
  icon?: ReactNode
  href?: string
  onClick?: () => void
  isActive?: boolean
  className?: string
}

interface MobileMenuSectionProps {
  title: string
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
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export function MobileMenuSection({ title, children, className }: MobileMenuSectionProps) {
  const reduced = useReducedMotion()
  const itemTransition: Transition = reduced ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }
  return (
    <>
      <motion.li
        variants={itemVariants}
        transition={itemTransition}
        className={className}
      >
        <h3 className="pt-2 -mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-text-100/60">
          {title}
        </h3>
      </motion.li>
      {children}
    </>
  )
}

export function MobileMenuItem({ children, icon, href, onClick, isActive, className }: MobileMenuItemProps) {
  const reduced = useReducedMotion()
  const itemTransition: Transition = reduced ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }
  const itemClasses = `w-full py-2 px-3 text-text-100 font-normal border-b border-principal-300/10 flex items-center gap-3 ${isActive ? "text-principal-400 italic border-b-3 border-principal-300/50" : ""}`
  const content = (
    <>
      {icon}
      <span className="flex-1 text-left">{children}</span>
      <ChevronRight className="w-5 h-5" />
    </>
  )
  return (
    <motion.li
      variants={itemVariants}
      transition={itemTransition}
      className={className}
    >
      {href ? (
        <Link href={href} className={itemClasses}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={itemClasses}>
          {content}
        </button>
      )}
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

  const panelTransition: Transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: "easeOut" }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="flex items-center justify-center py-2 text-text-100 lg:hidden"
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
              transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
              onClick={close}
            />
            <motion.aside
              key="mobile-menu-panel"
              id="mobile-menu-panel"
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              className="fixed top-0 left-0 h-full w-full max-w-sm bg-bg-100 z-50 flex flex-col p-4"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={panelTransition}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xl ${branch.className}`}>Bonita maquillaje</span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Cerrar menú"
                  className="p-2 text-text-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                transition={reducedMotion ? { staggerChildren: 0, delayChildren: 0 } : undefined}
                className="flex-1 flex flex-col gap-5 overflow-y-auto"
                onClick={close}
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
