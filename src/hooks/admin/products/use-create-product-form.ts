"use client"

import { FileStateItem, Inputs } from "@/types/admin/admin"
import { Category, Product, Tone as ToneType } from "@/types/db/db"
import { useRouter } from "next/navigation"
import { BaseSyntheticEvent, useEffect, useState } from "react"
import { useForm } from "../../common/use-form"
import { productSchema } from "@/validations/admin/products/product-schema"
import { v4 as uuidv4 } from 'uuid'
import { createProduct } from "@/app/actions/admin/products"
import { getAuthToken } from "@/lib/auth-token"
import { saveFile } from "@/firebase/services/storage"
import { useProductsContext } from "./use-products-context"
import { useStoreCategory } from "@/stores/common/category.store"

export const useCreateProductForm = () => {
  const [imgs, setImgs] = useState<File[] | FileStateItem[]>([])
  const [categories, setCategories] = useState<Pick<Category, "name" | "id">[]>([])
  const storeCategories = useStoreCategory(state => state.categories)
  const fetchCategories = useStoreCategory(state => state.fetchCategories)
  const [errorImgs, setErrorImgs] = useState("")
  const [tones, setTones] = useState<ToneType[]>([])
  const [error, setError] = useState<string>("")
  const router = useRouter()
  const { refreshProducts } = useProductsContext()

  const {
    register, handleSubmit, loading, errors
  } = useForm<Inputs>({
    schema: productSchema,
    actionSubmit: async (data) => {
      setError("")

      if (imgs.length === 0) {
        setErrorImgs("Se requiere cargar imagenes")
        return
      }

      try {
        const productId = uuidv4()
        const newImgs: FileStateItem[] = await Promise.all(
          imgs.map(async (img) => {
            const { url, name } = await saveFile(img as File, productId, "/products")

            return {
              name,
              url,
              size: img.size
            }
          })
        )

        const product: Product = {
          ...data,
          id: productId,
          imgs: newImgs,
          tones
        }

        const token = await getAuthToken()
        const result = await createProduct(token, product)
        if (!result.ok) {
          throw new Error(result.error)
        }
        router.push(`/admin/productos?categoria=${data.category}`)
        refreshProducts(data.category)
      } catch (error) {
        setError("Ocurrio un error al guardar el producto")
      }

    }
  })

  useEffect(() => {
    const getC = async () => {

      if (storeCategories.length === 0) {
        await fetchCategories()
      }

      setCategories(storeCategories.map(category => ({
        name: category.name,
        id: category.id
      })))
    }

    getC()
  }, [storeCategories, fetchCategories])

  useEffect(() => {
    setErrorImgs("")
  }, [imgs])

  const onSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()

    if (imgs.length === 0) {
      setErrorImgs("Se requiere cargar imagenes")
    }

    await handleSubmit(e)
  }

  return {
    categories,
    onSubmit,
    error,
    errorImgs,
    errors,
    imgs,
    setImgs,
    register,
    loading,
    setTones,
    tones
  }
}
