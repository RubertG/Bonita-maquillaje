import Skeleton from "react-loading-skeleton"

interface Props {
  variant?: "default" | "list"
}

// Mirrors the two Category layouts so the placeholder keeps the same footprint
// as the row that replaces it.
export const CategorySkeleton = ({ variant = "default" }: Props) => {
  if (variant === "list") {
    return (
      <article
        className="rounded-lg w-full flex items-center justify-between gap-3 px-3 py-2"
      >
        <Skeleton
          className="text-sm"
          containerClassName="flex-1"
        />
        <Skeleton
          width={20}
          height={20}
          borderRadius={4}
        />
      </article>
    )
  }

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
