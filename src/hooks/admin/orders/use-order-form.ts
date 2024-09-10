"use client"

import { ALL_CATEGORY } from "@/consts/admin/orders"
import { getDiscountCode } from "@/firebase/services/discount-codes"
import { useForm } from "@/hooks/common/use-form"
import { InputsOrders, Product } from "@/types/admin/admin"
import { orderSchema } from "@/validations/admin/orders/order-schema"
import { useEffect, useState } from "react"

interface Props {
  actionSubmit: (data: InputsOrders) => Promise<void>
  defaultValues?: InputsOrders
}

export const useOrderForm = ({
  actionSubmit,
  defaultValues
}: Props) => {
  const [searchedProducts, setSearchedProducts] = useState<{
    original: Product[],
    filtered: Product[]
  }>({
    original: [],
    filtered: []
  })
  const [products, setProducts] = useState<Product[]>([])
  const [loadingCode, setLoadingCode] = useState(false)
  const [errorDiscountCode, setErrorDiscountCode] = useState("")
  const [errorProducts, setErrorProducts] = useState("")
  const [errorSubmit, setErrorSubmit] = useState("")
  const { errors, handleSubmit, loading, register } = useForm<InputsOrders>({
    schema: orderSchema,
    values: defaultValues,
    actionSubmit
  })

  useEffect(() => {
    setErrorSubmit("")
    setErrorProducts("")
  }, [searchedProducts.filtered])

  useEffect(() => {
    setErrorSubmit("")
  }, [errors])

  const handleClickDiscountCode = async (code: string) => {
    setErrorDiscountCode("")
    setLoadingCode(true)
    const discountCode = await getDiscountCode(code)

    if (!discountCode || !discountCode.expiration) {
      setErrorDiscountCode("Código de descuento inválido")
      setLoadingCode(false)
      return
    }

    const inDate = new Date() < new Date(discountCode.expiration.seconds * 1000)

    if (!inDate) {
      setErrorDiscountCode("Código de descuento expirado")
      setLoadingCode(false)
      return
    }

    const newProducts = products.map(p => {
      if (p.category === discountCode.category || discountCode.category === ALL_CATEGORY) {
        return {
          ...p,
          discountCode: {
            code: discountCode.code,
            discount: discountCode.discount
          }
        }
      }

      return p
    })
    setProducts(newProducts)
    setLoadingCode(false)
  }

  return {
    products,
    setProducts,
    searchedProducts,
    setSearchedProducts,
    loadingCode,
    errorDiscountCode,
    errorProducts,
    errorSubmit,
    errors,
    handleSubmit,
    register,
    loading,
    handleClickDiscountCode,
    setErrorProducts, 
    setErrorSubmit,
    setErrorDiscountCode
  }
}