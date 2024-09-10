"use client"

import { Input } from "@/components/common/input"
import { Popup } from "@/components/common/popup"
import { Tone } from "@/types/db/db"
import { useState } from "react"

interface Props {
  handlePopup: () => void
  handleAddTone: (tone: Tone) => void
}

export const TonePopup = ({ handlePopup, handleAddTone }: Props) => {
  const [tone, setTone] = useState<Tone>({
    name: "",
    color: "#000000"
  })
  const [errors, setErrors] = useState({
    name: "",
    color: ""
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTone({
      ...tone,
      [event.target.name]: event.target.value
    })
  }

  const addTone = () => {
    if (!tone.name || !tone.color) {
      setErrors({
        name: !tone.name ? "El nombre es requerido" : "",
        color: !tone.color ? "La tonalidad es requerida" : ""
      })
      return
    }
    handleAddTone(tone)
    handlePopup()
  }

  return (
    <Popup>
      <div className="p-4 bg-bg-100 shadow-button rounded-lg w-4/5 max-w-sm">
        <h2 className="text-text-100 text-center text-xl mb-3">Agregar tonalidad</h2>
        <hr className="border-bg-300 mb-3" />

        <label
          className="text-text-100 font-light mb-2 block mt-4"
          htmlFor="name">
          Nombre <span className="text-accent-300">*</span>
        </label>
        <Input
          name="name"
          onChange={handleChange}
          placeholder="Nombre del color" />
        {errors.name && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.name}</p>}

        <label
          className="text-text-100 font-light mb-2 block mt-4"
          htmlFor="color">
          Color <span className="text-accent-300">*</span>
        </label>
        <Input
          name="color"
          className="h-12"
          onChange={handleChange}
          type="color"
          placeholder="Tonalidad" />
        {errors.color && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.color}</p>}

        <footer className="flex items-center flex-row-reverse gap-3 mt-5">
          <button
            type="button"
            onClick={addTone}
            className="py-2.5 px-3.5 rounded-lg bg-accent-200 text-text-100 text-center shadow-button lg:hover:bg-principal-100 lg:transition-colors font-light">
            Añadir
          </button>
          <button
            type="button"
            className="text-text-200 lg:hover:text-text-50 lg:transition-colors flex items-center justify-center font-light"
            onClick={handlePopup}>
            Cancelar
          </button>
        </footer>
      </div>
    </Popup>
  )
}