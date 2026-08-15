"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm as useFormReactHook } from "react-hook-form"
import type { FieldValues, Resolver, SubmitHandler } from "react-hook-form"
import { z } from "zod/v4"

export type { FieldErrors, UseFormRegister, UseFormRegisterReturn, UseFormWatch } from "react-hook-form"

export function useForm<Inputs extends FieldValues = FieldValues>({
  schema,
  actionSubmit,
  values
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<any, any>
  actionSubmit: (data: Inputs) => Promise<void>
  values?: Inputs
}) {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useFormReactHook<Inputs>({
    values,
    resolver: zodResolver(schema) as unknown as Resolver<Inputs>
  })
  const [loading, setLoading] = useState(false)

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
    await actionSubmit(data)
    setLoading(false)
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    setError,
    errors,
    loading,
    watch,
    reset,
    setValue
  }
}
