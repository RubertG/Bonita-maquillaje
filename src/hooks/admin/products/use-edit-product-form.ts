"use client"

import { FileStateItem, Inputs } from "@/types/admin/admin"
import { Product, Tone as ToneType } from "@/types/db/db"
import { useRouter } from "next/navigation"
import { BaseSyntheticEvent, useEffect, useState } from "react"
import { useForm } from "../../common/use-form"
import { productSchema } from "@/validations/admin/products/product-schema"
import { getProduct } from "@/firebase/services/products"
import { updateProduct } from "@/app/actions/admin/products"
import { getAuthToken } from "@/lib/auth-token"
import { saveFile } from "@/firebase/services/storage"
import { useProductsContext } from "./use-products-context"

interface Props {
  id: string
}

export const useEditProductForm = ({ id }: Props) => {
  const [imgs, setImgs] = useState<File[]>([])
  const [defaultValues, setDefaultValues] = useState<Inputs>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    offerPrice: null,
    isBestSeller: false,
    isNew: false
  })
  const [errorImgs, setErrorImgs] = useState("")
  const [imgsOld, setImgsOld] = useState<FileStateItem[]>([])
  const [tones, setTones] = useState<ToneType[]>([])
  const [error, setError] = useState<string>("")
  const [images, setImages] = useState<Array<File | FileStateItem>>([])
  const router = useRouter()
  const { refreshProducts } = useProductsContext()

  const {
    register, handleSubmit, loading, errors, watch
  } = useForm<Inputs>({
    values: defaultValues,
    schema: productSchema,
    actionSubmit: async (data) => {
      setError("")
      setErrorImgs("")

      if (imgs.length === 0 && imgsOld.length === 0) {
        setErrorImgs("Se requiere cargar imagenes")
        return
      }

      try {
        const newImgs: FileStateItem[] = await Promise.all(
          images.map(async (img) => {
            if (img instanceof File) {
              const { url, name } = await saveFile(img as File, id, "/products")
              return {
                name,
                url,
                size: img.size
              }
            }

            return img
          })
        )

        const product: Product = {
          ...data,
          id,
          imgs: newImgs,
          tones
        }

        const token = await getAuthToken()
        const result = await updateProduct(token, product)
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
    setImages([...imgsOld, ...imgs])
  }, [imgsOld, imgs])

  useEffect(() => {
    const getP = async () => {
      const p = await getProduct(id)
      if (!p) return
      setDefaultValues({
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        offerPrice: p.offerPrice ?? null,
        isBestSeller: p.isBestSeller ?? false,
        isNew: p.isNew ?? false
      })
      setTones(p.tones)
      setImgsOld(p.imgs)
    }
    getP()
  }, [id])

  useEffect(() => {
    setErrorImgs("")
  }, [imgs])

  const onSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()
    
    if (imgs.length === 0 && imgsOld.length === 0) {
      setErrorImgs("Se requiere cargar imagenes")
      return
    }

    await handleSubmit(e)
  }

  return {
    onSubmit,
    error,
    errorImgs,
    errors,
    imgs,
    setImgs,
    register,
    loading,
    setTones,
    tones,
    defaultValues,
    imgsOld,
    setImgsOld,
    images,
    setImages,
    watch
  }
}
