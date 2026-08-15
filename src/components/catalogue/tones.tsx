"use client"

import { Tone as ToneType } from "@/types/db/db"
import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const buildToneUrl = (color?: string, cantidad?: string) => {
  const url = new URLSearchParams({
    ...(color && { color }),
    ...(cantidad && { cantidad })
  })
  return `?${url.toString()}`
}

export const Tones = ({
  className, tones, searchParams: { color, cantidad }
}: {
  className?: string,
  tones: ToneType[], 
  searchParams: {
    [key: string]: string | undefined
  }
}) => {
  const router = useRouter()

  useEffect(() => {
    if (color) return

    router.replace(buildToneUrl(tones[0].color, cantidad), {
      scroll: false
    })
  }, [cantidad, color, router, tones])

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {
        tones.map((tone) => {
          const href = buildToneUrl(tone.color, cantidad)
          return (
            <Link
              key={tone.name}
              scroll={false}
              href={href}
              className={clsx("text-text-200 font-light flex justify-center items-center gap-1.5 cursor-pointer py-1.5 px-2.5 transition-all hover:shadow-button rounded-lg hover:bg-bg-50", {
                "bg-bg-50 shadow-button": tone.color === color
              })}
            >
              <div
                style={{ backgroundColor: tone.color }}
                className={`rounded-full w-5 h-5`}
              ></div>
              <p>{tone.name}</p>
            </Link>
          )
        })
      }
    </div>
  )
}