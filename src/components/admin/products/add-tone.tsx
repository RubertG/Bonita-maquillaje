"use client"

import { Plus } from "@/components/common/icons"
import { Tone as ToneType } from "@/types/db/db"
import { Tone } from "./tone"
import { useState } from "react"
import { TonePopup } from "./tone-popup"

interface Props {
  className?: string
  tones: ToneType[]
  setTones: (tones: ToneType[]) => void
}

export const AddTone = ({ className, tones, setTones }: Props) => {
  const [popup, setPopup] = useState(false)

  const handlePopup = () => setPopup(!popup)

  const handleAddTone = (tone: ToneType) => {
    setTones([...tones, tone])
  }

  const handleDelete = (tone: ToneType) => {
    setTones(tones.filter((t) => t.name !== tone.name))
  }

  return (
    <>
      <section className={`${className}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-100">Tonalidades</p>
          <button
          className="lg:hover:scale-125 lg:transition-transform"
            type="button"
            onClick={handlePopup}
          >
            <Plus className="stroke-accent-300" />
          </button>
        </div>
        <ul className="flex flex-wrap gap-5 gap-y-3 lg:gap-1 lg:gap-y-0">
          {tones.map((tone, index) => (
            <Tone tone={tone} key={index} handleDelete={handleDelete} />
          ))}
          {tones.length === 0 && (
            <p className="text-text-200 font-light text-sm">No hay tonalidades agregadas</p>
          )}
        </ul>
      </section>

      {popup && (
        <TonePopup handlePopup={handlePopup} handleAddTone={handleAddTone} />
      )}
    </>
  )
}