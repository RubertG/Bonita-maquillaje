import Link from "next/link"
import { Back } from "./icons"

interface Props {
  className?: string
  href: string
}

export const BackButton = ({ className, href }: Props) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1 text-text-200 font-light cursor-pointer lg:hover:text-text-50 lg:transition-colors ${className}`}>
      <Back className="w-5 h-5" />
      Atrás
    </Link>
  )
}