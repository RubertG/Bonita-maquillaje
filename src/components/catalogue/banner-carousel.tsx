"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { A11y, Autoplay, Pagination } from "swiper/modules"
import Image from "next/image"
import { useRef } from "react"
import type { FocusEvent, KeyboardEvent } from "react"
import type { Swiper as SwiperInstance } from "swiper"
import { Banner } from "@/types/db/db"

import "swiper/css"
import "swiper/css/pagination"

interface Props {
  banners: Banner[]
  className?: string
}

export const BannerCarousel = ({ banners, className }: Props) => {
  const swiperRef = useRef<SwiperInstance | null>(null)
  const hoveringRef = useRef(false)
  const focusedRef = useRef(false)

  const showControls = banners.length > 1

  if (banners.length === 0) return null

  // Slides are reachable by swipe, by the pagination bullets, and by arrow keys.
  // There are no side arrow buttons.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!showControls) return
    if (event.key === "ArrowLeft") swiperRef.current?.slidePrev()
    if (event.key === "ArrowRight") swiperRef.current?.slideNext()
  }

  // Autoplay pauses on hover and on focus. Both conditions are tracked here rather
  // than delegating hover to Swiper's pauseOnMouseEnter, so that resuming can require
  // both to be clear — otherwise blurring while still hovering would restart autoplay.
  const resumeAutoplay = () => {
    if (hoveringRef.current || focusedRef.current) return
    swiperRef.current?.autoplay?.start()
  }

  const handleMouseEnter = () => {
    hoveringRef.current = true
    swiperRef.current?.autoplay?.stop()
  }

  const handleMouseLeave = () => {
    hoveringRef.current = false
    resumeAutoplay()
  }

  const handleFocus = () => {
    focusedRef.current = true
    swiperRef.current?.autoplay?.stop()
  }

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return
    focusedRef.current = false
    resumeAutoplay()
  }

  return (
    <section
      className={`relative w-full ${className}`}
      aria-label="Promociones"
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Swiper
        className="banner-swiper"
        modules={[Pagination, Autoplay, A11y]}
        slidesPerView={1}
        loop={showControls}
        pagination={showControls ? { clickable: true } : false}
        autoplay={showControls ? { delay: 5000, disableOnInteraction: false } : false}
        onSwiper={(swiper) => { swiperRef.current = swiper }}
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id}>
            <div className={`relative w-full ${banner.imgDesktop ? "aspect-[17/9] lg:aspect-[21/9]" : "aspect-[17/9]"}`}>
              {banner.imgDesktop ? (
                <picture>
                  <source media="(min-width: 1024px)" srcSet={banner.imgDesktop.url} />
                  <Image
                    src={banner.img.url}
                    alt={banner.alt}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    draggable={false}
                    className="object-cover select-none pointer-events-none"
                  />
                </picture>
              ) : (
                <Image
                  src={banner.img.url}
                  alt={banner.alt}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  draggable={false}
                  className="object-cover select-none pointer-events-none"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
