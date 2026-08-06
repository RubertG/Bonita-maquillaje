import Skeleton from "react-loading-skeleton"

export const CategorySkeleton = () => {
  return (
    <article
      className="rounded-lg p-2 flex flex-col items-center justify-center gap-1 w-24 shrink-0 aspect-square overflow-hidden"
    >
      <Skeleton
        className="w-12 h-12 aspect-square" />
      <Skeleton
        className="text-xs"
        width="100%"
      />
    </article>
  )
}