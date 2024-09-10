import Skeleton from "react-loading-skeleton"

export const CategorySkeleton = () => {
  return (
    <article
      className="rounded-lg min-w-20"
    >
      <Skeleton
        className="w-14 h-14 m-auto mb-1 aspect-square" />
      <Skeleton
        className="text-sm"
      />
    </article>
  )
}