"use client"

import { Button } from "@/components/common/button"
import { Save, Spinner } from "@/components/common/icons"
import { Input, SelectInput } from "@/components/common/input"
import { ALL_CATEGORY } from "@/consts/admin/orders"
import { getCategories } from "@/firebase/services/categories"
import { saveDiscountCode } from "@/firebase/services/discount-codes"
import { useForm } from "@/hooks/common/use-form"
import { Category, DiscountCode } from "@/types/db/db"
import { discountCodeSchema } from "@/validations/admin/discount-code/discount-code-schema"
import clsx from "clsx"
import { Timestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from 'uuid'

interface Inputs {
  code: string
  discount: string
  category: string
  day: string
}

export const DiscountCodeForm = ({
  className
}: {
  className?: string
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string>("")
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const { errors, handleSubmit, loading, register } = useForm<Inputs>({
    schema: discountCodeSchema,
    actionSubmit: async (inputs) => {
      setError("")
      try {
        const newCode: DiscountCode = {
          id: uuidv4(),
          code: inputs.code,
          discount: parseInt(inputs.discount),
          expiration: Timestamp.fromDate(new Date(inputs.day)),
          category: inputs.category
        }
        await saveDiscountCode(newCode)
        router.refresh()
        formRef.current?.reset()
      } catch (error) {
        setError("Error al crear el código de descuento")
      }
    }
  })

  useEffect(() => {
    const getC = async () => {
      const categories = await getCategories()

      if (!categories) return

      setCategories(categories)
    }
    getC()
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      ref={formRef}
      className={`${className}`}>
      <label
        className="text-text-100 mb-2 block"
        htmlFor="code">
        Código de descuento <span className="text-accent-300">*</span>
      </label>
      <Input
        id="code"
        placeholder="Código de descuento"
        {...register("code")}
      />
      {errors.code?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.code?.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-4"
        htmlFor="discount">
        Porcentaje de descuento <span className="text-accent-300">*</span>
      </label>
      <Input
        id="discount"
        type="number"
        min={1}
        max={100}
        placeholder="De 1 a 100"
        {...register("discount")}
      />
      {errors.discount?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.discount?.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-4"
        htmlFor="category">
        Seleccione la categoría <span className="text-accent-300">*</span>
      </label>
      <SelectInput
        id="category"
        title="Seleccione la categoría"
        items={[{
          name: "Todas las categorías",
          id: ALL_CATEGORY
        }, ...categories]}
        {...register("category")}
      />
      {errors.category?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.category?.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-4"
        htmlFor="day">
        Día de caducidad <span className="text-accent-300">*</span>
      </label>
      <Input
        id="day"
        type="date"
        className="appearance-none"
        {...register("day")}
      />
      {errors.day?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.day?.message}</p>}

      <Button
        className="w-full my-6"
      >
        <Save className="absolute top-1/2 -translate-y-1/2 left-0 ml-3.5 stroke-text-100" />
        <Spinner className={clsx("w-5 h-5 absolute opacity-0 transition-opacity", { "opacity-100": loading })} />
        <p className={clsx("transition-opacity", { "opacity-0": loading })}>Guardar código</p>
      </Button>
      {error && <p className="text-red-500 font-light px-3.5 -mt-2 text-sm">{error}</p>}
    </form>
  )
}