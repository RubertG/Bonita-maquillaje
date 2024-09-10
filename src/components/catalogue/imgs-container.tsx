"use client"

import { FileStateItem } from "@/types/admin/admin"
import clsx from "clsx"
import { useState } from "react"
import { Search, X } from "../common/icons"
import { Popup } from "../common/popup"

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
        <button
          onClick={() => setPopup(!popup)}
          className="absolute top-2.5 left-2.5 bg-bg-100/40 backdrop-blur-sm p-1.5 rounded-full group"
        >
          <Search className="w-5 h-5 stroke-text-100 lg:group-hover:stroke-accent-300 lg:transition-colors" />
        </button>
        <img
          src={imgs[imgActive].url}
          alt={`${imgs[imgActive].name} - Bonita Maquillaje`}
          className="w-full object-cover rounded-lg aspect-[3.5/4]"
          loading="lazy"
        />
      </picture>
      <footer className="mt-2.5 flex gap-2 items-center overflow-auto pb-1 scrollbar-hide-sm">
        {
          imgs.length > 1 && (
            imgs.map((img, i) => (
              <img
                key={img.name}
                src={img.url}
                alt={`${img.name} - Bonita Maquillaje`}
                loading="lazy"
                onClick={() => handleImgActive(i)}
                className={clsx("w-24 object-cover rounded-lg aspect-[3.5/4] cursor-pointer border transition-colors", {
                  "border-accent-300": imgActive === i,
                  "border-transparent": imgActive !== i
                })}
              />
            ))
          )
        }
      </footer>
      {
        popup && (
          <Popup>
            <button
              className="group absolute top-4 right-4"
              onClick={() => setPopup(false)}
            >
              <X className="w-7 h-7 stroke-text-100 lg:group-hover:stroke-accent-300 lg:transition-colors" />
            </button>
            <div className="flex items-center justify-center px-4">
              <img
                loading="lazy"
                src={imgs[imgActive].url}
                alt={`${imgs[imgActive].name} - Bonita Maquillaje`}
                className="w-full md:w-[90%] max-h-screen object-cover rounded-lg shadow-button"
              />
            </div>
          </Popup>
        )
      }
    </div>
  )
}