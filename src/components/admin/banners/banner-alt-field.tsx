"use client"

import { KeyboardEvent, useEffect, useRef } from "react"
import { Edit } from "@/components/common/icons"
import { useBannerAlt } from "@/hooks/admin/banner/use-banner-alt"
import { Banner } from "@/types/db/db"

interface Props {
  banner: Banner
  disabled?: boolean
}

export const BannerAltField = ({ banner, disabled }: Props) => {
  const { editing, value, error, setValue, startEditing, cancel, commit } = useBannerAlt(banner)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Enter blurs rather than committing directly, so both exit paths run the
    // exact same code and cannot drift apart.
    if (event.key === "Enter") {
      event.preventDefault()
      inputRef.current?.blur()
    }

    if (event.key === "Escape") {
      event.preventDefault()
      cancel()
    }
  }

  if (!editing) {
    return (
      <div className="w-full min-w-0">
        <button
          type="button"
          onClick={startEditing}
          disabled={disabled}
          title="Editar texto alternativo"
          className="group flex w-full min-w-0 items-center gap-2 text-left disabled:opacity-50"
        >
          <span className="font-light text-text-200 truncate">{banner.alt}</span>
          <Edit className="shrink-0 stroke-text-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
        </button>
        {error && <p className="text-red-500 font-light text-sm mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="w-full min-w-0">
      <input
        ref={inputRef}
        type="text"
        value={value}
        aria-label="Texto alternativo del banner"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        className="w-full min-w-0 rounded-lg px-2.5 py-1.5 bg-bg-100 text-text-200 font-light focus:outline-bg-200 shadow-button"
      />
    </div>
  )
}
