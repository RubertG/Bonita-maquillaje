import Skeleton from "react-loading-skeleton"

export const ImgsContainerSkeleton = () => {
  return (
    <div>
      <picture className="w-full relative">
        <Skeleton
          className="w-full object-cover rounded-lg aspect-[3.5/4]"
        />
      </picture>
      <footer className="mt-2.5 flex gap-2 items-center overflow-hidden h-32">
        {
          Array(3).fill(0).map((_, i) => (
            <Skeleton
              key={i}
              className="block h-32 w-24 object-cover rounded-lg aspect-[3.5/4]"
            />
          ))
        }
      </footer>
    </div>
  )
}