"use client"

import { branch } from "@/fonts/branch/branch"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export const Button = ({ children, onClick, className, ...props }: Props) => {
  return (
    <button
      className={`relative inline-flex items-center justify-center py-2.5 px-3.5 rounded-lg bg-accent-200 text-text-100 gap-2 text-center text-xl shadow-button lg:hover:bg-principal-100 lg:transition-colors ${branch.className} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}