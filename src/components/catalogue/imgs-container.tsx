"use client"

import { FileStateItem } from "@/types/admin/admin"
import clsx from "clsx"
import { useState } from "react"
import { Photo, Search, X } from "../common/icons"
import { Popup } from "../common/popup"
import { ScrollRow } from "@/components/common/scroll-row"
import Image from "next/image"

export const ImgsContainer = ({
  imgs,
  className
}: {
  imgs: FileStateItem[],
  className?: string
}) => {
  const [imgActive, setImgActive] = useState(0)
  const [popup, setPopup] = useState(false)

  const handleImgActive = (id: number) => setImgActive(id)

  return (
    <div className={`${className}`}>
      <picture className="w-full relative">
        {imgs[imgActive]?.url && (
          <button
            onClick={() => setPopup(!popup)}
            className="absolute top-2.5 left-2.5 bg-bg-100/40 backdrop-blur-sm p-1.5 rounded-full group"
          >
            <Search className="w-5 h-5 stroke-text-100 lg:group-hover:stroke-accent-300 lg:transition-colors" />
          </button>
        )}
        {imgs[imgActive]?.url ? (
          <Image
            width={400}
            height={300}
            src={imgs[imgActive].url}
            alt={`${imgs[imgActive].name} - Bonita Maquillaje`}
            className="w-full object-cover rounded-lg aspect-[3.5/4]"
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        ) : (
          <div className="w-full aspect-[3.5/4] rounded-lg bg-bg-200 flex flex-col items-center justify-center gap-3 text-text-200">
            <Photo className="w-16 h-16" />
            <span className="text-base">Sin imagen</span>
          </div>
        )}
      </picture>
      {imgs.length > 1 && (
        <ScrollRow
          className="mt-2.5"
          slideClassName="!w-auto"
          spaceBetween={8}
        >
          {
            imgs.filter(img => img.url).map((img, i) => (
              <Image
                width={120}
                height={105}
                key={img.name}
                src={img.url}
                alt={`${img.name} - Bonita Maquillaje`}
                loading="lazy"
                sizes="96px"
                onClick={() => handleImgActive(i)}
                className={clsx("w-24 object-cover rounded-lg aspect-[3.5/4] cursor-pointer border transition-colors", {
                  "border-accent-300": imgActive === i,
                  "border-transparent": imgActive !== i
                })}
              />
            ))
          }
        </ScrollRow>
      )}
      {
        popup && imgs[imgActive]?.url && (
          <Popup>
            <button
              className="group absolute top-4 right-4"
              onClick={() => setPopup(false)}
            >
              <X className="w-7 h-7 stroke-text-100 lg:group-hover:stroke-accent-300 lg:transition-colors" />
            </button>
            <div className="relative w-full md:w-[90%] max-h-[90vh] aspect-[3.5/4] px-4">
              <Image
                fill
                src={imgs[imgActive].url}
                alt={`${imgs[imgActive].name} - Bonita Maquillaje`}
                className="object-contain rounded-lg shadow-button"
                sizes="100vw"
              />
            </div>
          </Popup>
        )
      }
    </div>
  )
}
