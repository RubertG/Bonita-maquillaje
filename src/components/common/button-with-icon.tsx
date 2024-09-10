import { branch } from "@/fonts/branch/branch"
import Link from "next/link"

interface Props {
  children: React.ReactNode
  href: string
  target?: string
  className?: string
}

export function ButtonWithIcon({
  children, href, target = "", className
}: Props) {
  return (
    <Link
      className={`relative inline-flex items-center justify-center py-2.5 px-3.5 rounded-lg bg-accent-200 text-text-100 gap-2 text-center text-xl shadow-button lg:hover:bg-principal-100 lg:transition-colors ${branch.className} ${className}`}
      target={target}
      rel="noreferrer"
      href={href}
    >
      {children}
    </Link>
  )
}
