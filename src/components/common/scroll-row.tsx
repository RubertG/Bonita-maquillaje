"use client"

import { Children, useRef } from "react"
import type { FocusEvent, ReactNode } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel } from "swiper/modules"
import type { Swiper as SwiperInstance } from "swiper"

import "swiper/css"

interface Props {
  children: ReactNode
  className?: string
  slideClassName?: string
  spaceBetween?: number
  wrapperTag?: string
  slideTag?: string
  offset?: number
  centerWhenShort?: boolean
}

export const ScrollRow = ({
  children,
  className,
  slideClassName,
  spaceBetween = 12,
  wrapperTag = "div",
  slideTag = "div",
  offset = 0,
  centerWhenShort = false
}: Props) => {
  const swiperRef = useRef<SwiperInstance | null>(null)

  // Swiper translates its wrapper instead of scrolling it, so the browser cannot bring an
  // off-screen focused element into view by itself. Without this, tabbing through a row moves
  // focus to items the user cannot see. Slides already in view are left alone so focusing a
  // visible item never shifts the row under the pointer. The handler lives on a plain wrapper
  // element because `on*` props given to `Swiper` are read as Swiper events, not DOM events.
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
    <div className={className} onFocus={handleFocus}>
      <Swiper
        modules={[FreeMode, Mousewheel]}
        wrapperTag={wrapperTag}
        slidesPerView="auto"
        spaceBetween={spaceBetween}
        slidesOffsetBefore={offset}
        slidesOffsetAfter={offset}
        centerInsufficientSlides={centerWhenShort}
        freeMode={{ enabled: true, momentumBounce: false }}
        mousewheel={{ forceToAxis: true }}
        grabCursor
        onSwiper={swiper => { swiperRef.current = swiper }}
      >
        {Children.map(children, child => (
          <SwiperSlide tag={slideTag} className={slideClassName}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
