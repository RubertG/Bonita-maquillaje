import Skeleton from "react-loading-skeleton"

export const ProductSkeleton = () => {
  return (
    <li className="lg:p-2.5 rounded-lg">
      <Skeleton
        className="w-full aspect-[3/4] object-cover rounded-lg"
      />
      <footer className="mt-2 text-center">
        <h2 className="text-text-100 overflow-hidden text-ellipsis whitespace-nowrap">
          <Skeleton />
        </h2>
        <p className="text-accent-300 text-sm">
          <Skeleton />
        </p>
      </footer>
    </li>
  )
}