"use client"

import { Delete } from "@/components/common/icons"
import { Tone as ToneType } from "@/types/db/db"

interface Props {
  tone: ToneType
  handleDelete: (tone: ToneType) => void
}

export const Tone = ({ tone, handleDelete }: Props) => {
  return (
    <li
      className="text-text-200 relative font-light flex justify-center items-center gap-1.5 cursor-pointer lg:py-1.5 lg:px-2.5 lg:transition-shadow lg:hover:shadow-button rounded-lg lg:group overflow-hidden"
      onClick={() => handleDelete(tone)}
    >
      <div className="absolute w-full h-full top-0 left-0 hidden opacity-0 lg:block lg:hover:bg-bg-50 lg:hover:bg-opacity-60 lg:hover:backdrop-blur-sm lg:transition-all lg:hover:opacity-100">
        <div className="flex justify-center items-center h-full">
          <Delete className="stroke-text-200 w-5.5 h-5.5" />
        </div>
      </div>
      <div
        style={{ backgroundColor: tone.color }}
        className={`rounded-full w-5 h-5`}
      ></div>
      <p>{tone.name}</p>
    </li>
  )
}