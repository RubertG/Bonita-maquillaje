import { branch } from '@/fonts/branch/branch'
import React from 'react'

export function H1({
  className,
  children
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <h1 className={`${className} ${branch.className} text-text-50 text-[2.5rem] md:text-5xl lg:text-6xl text-center leading-[3rem] lg:leading-none`}>
      {children}
    </h1>
  )
}
