"use client"

import { Children, useEffect, useRef, useState } from "react"
import type { FocusEvent, ReactNode } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { A11y, Autoplay, Mousewheel } from "swiper/modules"
import type { Swiper as SwiperInstance } from "swiper"

import "swiper/css"

interface Props {
  children: ReactNode
  direction?: "right-to-left" | "left-to-right"
  className?: string
  slideClassName?: string
  spaceBetween?: number
  wrapperTag?: string
  slideTag?: string
  offset?: number
  delayMs?: number
}

export const AutoScrollRow = ({
  children,
  direction = "right-to-left",
  className,
  slideClassName,
  spaceBetween = 12,
  wrapperTag = "div",
  slideTag = "div",
  offset = 0,
  delayMs = 3000
}: Props) => {
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const items = Children.toArray(children)
  const shouldLoop = items.length > 1
  const MIN_SLIDES_FOR_LOOP = 12
  const repeatedItems = shouldLoop
    ? Array.from({ length: Math.ceil(MIN_SLIDES_FOR_LOOP / items.length) }, () => items).flat()
    : items
  const enableLoop = shouldLoop && repeatedItems.length > 7

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(media.matches)

    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [])

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    const swiper = swiperRef.current
    if (!swiper) return

    const slide = (event.target as HTMLElement).closest<HTMLElement>(".swiper-slide")
    if (!slide) return

    const row = swiper.el.getBoundingClientRect()
    const target = slide.getBoundingClientRect()
    if (target.left >= row.left && target.right <= row.right) return

    const index = swiper.slides.indexOf(slide)
    if (index >= 0) swiper.slideTo(index)
  }

  return (
    <div
      className={className}
      style={{ paddingLeft: offset, paddingRight: offset }}
      onFocus={handleFocus}
    >
      <Swiper
        modules={[Autoplay, Mousewheel, A11y]}
        wrapperTag={wrapperTag}
        slidesPerView="auto"
        slidesPerGroup={1}
        spaceBetween={spaceBetween}
        speed={400}
        grabCursor
        loop={enableLoop}
        rewind={!enableLoop}
        loopAdditionalSlides={1}
        watchOverflow
        threshold={8}
        autoplay={
          reducedMotion
            ? false
            : {
              delay: delayMs,
              disableOnInteraction: false,
              reverseDirection: direction === "left-to-right"
            }
        }
        mousewheel={{ forceToAxis: true }}
        onSwiper={swiper => { swiperRef.current = swiper }}
      >
        {repeatedItems.map((child, index) => (
          <SwiperSlide key={index} tag={slideTag} className={slideClassName}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
