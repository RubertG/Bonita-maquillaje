"use client"

import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from "react"

interface CheckboxProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string
  error?: string
}

export const Checkbox = forwardRef(function Checkbox(
  { className, label, error, ...props }: CheckboxProps,
  ref: React.Ref<HTMLInputElement> | undefined
) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="w-5 h-5 rounded border-gray-400 accent-principal-100 focus:ring-principal-100 cursor-pointer"
        {...props}
        {...(ref == undefined ? {} : { ref })}
      />
      <span className="text-text-100 font-light">{label}</span>
      {error && <span className="text-red-500 text-sm font-light ml-auto">{error}</span>}
    </label>
  )
})