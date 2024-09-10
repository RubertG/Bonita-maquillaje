"use client"

import { Spinner } from "@/components/common/icons"
import { Popup } from "@/components/common/popup"
import clsx from "clsx"

export const PopupDelete = ({
  title,
  handleDelete,
  loading,
  handlePopup
}: {
  title: string
  handlePopup: () => void
  handleDelete: () => void
  loading: boolean
}) => {
  return (
    <Popup>
      <div className="p-4 bg-bg-50 shadow-button rounded-lg w-3/4 max-w-sm">
        <p className="text-text-100 text-center mb-3">{title}</p>
        <hr className="border-bg-300 mb-3" />
        <footer className="flex items-center justify-end gap-3">
          <button
            className="text-text-200 lg:hover:text-text-50 lg:transition-colors flex items-center justify-center"
            onClick={handleDelete}>
            <Spinner className={clsx("w-5 h-5 absolute transition-opacity", {
              "opacity-0": !loading
            })} />
            <p className={clsx("transition-opacity", { "opacity-0": loading })}>Eliminar</p>
          </button>
          <button
            className="py-2.5 px-3.5 rounded-lg bg-accent-200 text-text-100 text-center shadow-button lg:hover:bg-principal-100 lg:transition-colors"
            onClick={handlePopup}>Cancelar</button>
        </footer>
      </div>
    </Popup>
  )
}