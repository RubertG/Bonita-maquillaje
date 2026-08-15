import { createDiscountCode } from "@/app/actions/admin/discount-codes"
import { getAuthToken } from "@/lib/auth-token"
import { useForm } from "@/hooks/common/use-form"
import { useStoreCategory } from "@/stores/common/category.store"
import { discountCodeSchema } from "@/validations/admin/discount-code/discount-code-schema"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from 'uuid'

interface Inputs {
  code: string
  discount: string
  category: string
  day: string
}

export const useDiscountForm = () => {
  const [error, setError] = useState<string>("")
  const categories = useStoreCategory(state => state.categories)
  const fetchCategories = useStoreCategory(state => state.fetchCategories)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const { errors, handleSubmit, loading, register } = useForm<Inputs>({
    schema: discountCodeSchema,
    actionSubmit: async (inputs) => {
      setError("")
      try {
        const token = await getAuthToken()
        const result = await createDiscountCode(token, {
          id: uuidv4(),
          code: inputs.code,
          discount: parseInt(inputs.discount),
          expiration: inputs.day,
          category: inputs.category
        })
        if (!result.ok) {
          throw new Error(result.error)
        }
        router.refresh()
        formRef.current?.reset()
      } catch (error) {
        setError("Error al crear el código de descuento")
      }
    }
  })

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    error,
    categories,
    formRef,
    handleSubmit,
    loading,
    errors,
    register
  }
}
