import Skeleton from "react-loading-skeleton"
import clsx from "clsx"

interface Props {
  className?: string
}

export const ProductSkeleton = ({ className }: Props) => {
  return (
    <li className={clsx("lg:p-2.5 rounded-lg", className)}>
      <Skeleton
        className="w-full aspect-[3/4] object-cover rounded-lg"
      />
      <footer className="mt-2 text-center">
        <p className="text-text-100 overflow-hidden text-ellipsis whitespace-nowrap">
          <Skeleton />
        </p>
        <p className="text-accent-300 text-sm">
          <Skeleton />
        </p>
      </footer>
    </li>
  )
}