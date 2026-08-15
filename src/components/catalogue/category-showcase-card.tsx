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
    className={clsx("group p-2 relative w-full h-full aspect-square overflow-hidden border border-bg-300 rounded-xl flex justify-center items-end", className)}
  >
    <Image
      src={img.url?.trim() || "/logo.webp"}
      alt={`${name} - Bonita Maquillaje`}
      fill
      sizes="(min-width: 1024px) 352px, 50vw"
      loading="lazy"
      className="absolute inset-0 object-cover transition-transform duration-300 lg:motion-safe:group-hover:scale-105"
    />
    <div className={`rounded-lg bg-bg-50/80 backdrop-blur-[2px] px-2 py-1 text-center text-sm font-bold text-principal-300 ${branch.className}`}>
      {name}
    </div>
  </Link>
)
