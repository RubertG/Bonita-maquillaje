import { saveDiscountCode } from "@/firebase/services/discount-codes"
import { useForm } from "@/hooks/common/use-form"
import { useStoreCategory } from "@/stores/common/category.store"
import { DiscountCode } from "@/types/db/db"
import { discountCodeSchema } from "@/validations/admin/discount-code/discount-code-schema"
import { Timestamp } from "firebase/firestore"
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
    fetchCategories()
  }, [])

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