import { Delete, Edit } from "@/components/common/icons"
import Skeleton from "react-loading-skeleton"

export const ProductSkeleton = () => {
  return (
    <li
      className="grid grid-cols-[1fr_auto] gap-2 items-center rounded-lg lg:p-2 entry"
    >
      <div className="grid grid-cols-[64px_1fr] gap-2 items-center justify-between overflow-hidden">
        <Skeleton
          className="w-16 aspect-[3/4]" />
        <div className="grid">
          <Skeleton className="text-lg text-text-100 w-14" />
          <Skeleton className="text-lg w-14" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          disabled
        >
          <Edit className="stroke-principal-200 lg:hover:scale-110 lg:transition-transform" />
        </button>
        <button
          disabled
        >
          <Delete className="stroke-text-300 lg:hover:scale-110 lg:transition-transform" />
        </button>
      </div>
    </li>
  )
}