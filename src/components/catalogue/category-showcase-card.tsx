import { Category as CategoryType } from "@/types/db/db"
import { branch } from "@/fonts/branch/branch"
import clsx from "clsx"
import { Link } from "next-view-transitions"
import Image from "next/image"

interface Props {
  category: CategoryType
  className?: string
}

export const CategoryShowcaseCard = ({ category: { id, name, img }, className }: Props) => (
  <Link
    href={`/catalogo/productos?categoria=${encodeURIComponent(id)}`}
    className={clsx("group block relative aspect-square overflow-hidden border border-bg-300 rounded-xl", className)}
  >
    <Image
      src={img.url?.trim() || "/logo.webp"}
      alt={`${name} - Bonita Maquillaje`}
      fill
      sizes="(min-width: 1024px) 352px, 50vw"
      loading="lazy"
      className="object-cover transition-transform duration-300 lg:motion-safe:group-hover:scale-105"
    />
    <span className={`absolute bottom-2 w-fit left-1/2 -translate-x-1/2 truncate rounded-lg bg-bg-50/80 backdrop-blur-[2px] px-3 py-1 text-center text-accent-300 ${branch.className}`}>
      {name}
    </span>
  </Link>
)
