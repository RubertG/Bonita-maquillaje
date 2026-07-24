"use client"

import { DetailedHTMLProps, forwardRef, InputHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"

type Variant = "primary" | "accent"

interface AnimatedCheckboxProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string
  description?: string
  variant?: Variant
  icon?: ReactNode
}

const trackVariant: Record<Variant, string> = {
  primary: "peer-checked:bg-principal-100",
  accent: "peer-checked:bg-principal-200"
}

export const AnimatedCheckbox = forwardRef(function AnimatedCheckbox(
  { className, label, description, variant = "primary", icon, checked, ...props }: AnimatedCheckboxProps,
  ref: React.Ref<HTMLInputElement> | undefined
) {
  const isChecked = checked ?? false

  return (
    <label className={clsx("flex items-center gap-3 cursor-pointer select-none", className)}>
      <div className="relative w-12 h-7 shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          {...props}
          checked={isChecked}
          {...(ref == undefined ? {} : { ref })}
        />
        <div
          className={clsx(
            "absolute inset-0 rounded-full bg-bg-200 transition-colors duration-300 ease-in-out shadow-inner",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-principal-100 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-50",
            trackVariant[variant]
          )}
          aria-hidden="true"
        />
        <span
          className={clsx(
            "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-button flex items-center justify-center",
            "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] peer-checked:translate-x-5"
          )}
          aria-hidden="true"
        >
          {icon && (
            <span
              className={clsx(
                "transition-all duration-200",
                isChecked ? "opacity-100 scale-100" : "opacity-0 scale-75"
              )}
            >
              {icon}
            </span>
          )}
        </span>
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className={clsx(
            "text-text-100 font-light transition-colors duration-200",
            isChecked && "text-principal-300"
          )}
        >
          {label}
        </span>
        {description && (
          <span className="text-text-300 text-xs font-light">{description}</span>
        )}
      </div>
    </label>
  )
})
