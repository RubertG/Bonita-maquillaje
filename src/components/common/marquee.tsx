import { Fragment } from "react"
import clsx from "clsx"

interface Props {
  items: string[]
  className?: string
  durationSeconds?: number
  separator?: string | null
}

const renderItems = (items: string[], copyId: string, separator: string | null) =>
  items.map((item, index) => (
    <Fragment key={`${copyId}-${index}`}>
      <li className="flex shrink-0 items-center whitespace-nowrap text-sm text-text-100 motion-reduce:shrink motion-reduce:whitespace-normal">
        {item}
      </li>
      <li aria-hidden="true" className="shrink-0 px-4 text-principal-200">
        {separator}
      </li>
    </Fragment>
  ))

export const Marquee = ({ items, className, durationSeconds, separator = "•" }: Props) => (
  <div
    className={clsx(
      "w-full overflow-hidden bg-bg-50 border-b border-bg-200 h-12 flex-none [container-type:inline-size] motion-reduce:h-auto motion-reduce:py-2",
      className
    )}
  >
    <div
      className="flex w-max h-full items-center animate-marquee motion-reduce:animate-none motion-reduce:h-auto motion-reduce:w-full hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
      style={durationSeconds ? { animationDuration: `${durationSeconds}s` } : undefined}
    >
      <ul
        role="list"
        className="flex shrink-0 min-w-[100cqw] items-center justify-around motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center"
      >
        {renderItems(items, "a", separator)}
      </ul>
      <ul
        aria-hidden="true"
        className="flex shrink-0 min-w-[100cqw] items-center justify-around motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:hidden"
      >
        {renderItems(items, "b", separator)}
      </ul>
    </div>
  </div>
)
