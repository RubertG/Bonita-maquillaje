"use client"

import { useState } from "react"
import { Counter } from "../common/counter"
import { useRouter } from "next/navigation"

export const CounterProduct = ({
  className,
  price,
  searchParams: { color, cantidad }
}: {
  className?: string,
  price: number
  searchParams: {
    [key: string]: string | undefined
  }
}) => {
  const [count, setCount] = useState(cantidad ? parseInt(cantidad) : 0)
  const router = useRouter()

  const newUrl = (color?: string, cantidad?: string) => {
    const url = new URLSearchParams({
      ...(color && { color }),
      ...(cantidad && { cantidad })
    })
    return `?${url.toString()}`
  }

  const handleSubstract = () => {
    if (count === 0) return

    const newCount = count - 1
    setCount(newCount)
    router.replace(newUrl(color, newCount !== 0 ? String(newCount) : undefined), {
      scroll: false
    })
  }

  const handleSum = () => {
    setCount(count + 1)
    router.replace(newUrl(color, String(count + 1)), {
      scroll: false
    })
  }

  return (
    <div className={`flex items-center justify-start gap-3 lg:gap-5 ${className}`}>
      <Counter
        handleSubtract={handleSubstract}
        count={count}
        handleSum={handleSum}
      />
      {
        count > 0 && (
          <p className="entry text-lg text-accent-300">${Math.ceil(price * count)}</p>
        )
      }
    </div>
  )
}