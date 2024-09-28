"use client"

import { FileStateItem, Inputs } from "@/types/admin/admin"
import { Category, Product, Tone as ToneType } from "@/types/db/db"
import { useRouter } from "next/navigation"
import { BaseSyntheticEvent, useEffect, useState } from "react"
import { useForm } from "../../common/use-form"
import { productSchema } from "@/validations/admin/products/product-schema"
import { getProduct, updateProduct } from "@/firebase/services/products"
import { saveFile } from "@/firebase/services/storage"
import { useProductsContext } from "./use-products-context"
import { useStoreCategory } from "@/stores/common/category.store"

interface Props {
  id: string
}

export const useEditProductForm = ({ id }: Props) => {
  const [imgs, setImgs] = useState<File[]>([])
  const [defaultValues, setDefaultValues] = useState<Inputs>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: ""
  })
  const [categories, setCategories] = useState<Pick<Category, "name" | "id">[]>([])
  const [errorImgs, setErrorImgs] = useState("")
  const [imgsOld, setImgsOld] = useState<FileStateItem[]>([])
  const [tones, setTones] = useState<ToneType[]>([])
  const [error, setError] = useState<string>("")
  const [images, setImages] = useState<Array<File | FileStateItem>>([])
  const storeCategories = useStoreCategory(state => state.categories)
  const fetchCategories = useStoreCategory(state => state.fetchCategories)
  const router = useRouter()
  const { refreshProducts } = useProductsContext()

  const {
    register, handleSubmit, loading, errors
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
              const url = await saveFile(img as File, "/products")
              return {
                name: img.name,
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
          tones,
          price: parseFloat(data.price),
          stock: parseInt(data.stock)
        }

        await updateProduct(product)
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
        price: p.price.toString(),
        stock: p.stock.toString(),
        category: p.category
      })
      setTones(p.tones)
      setImgsOld(p.imgs)
    }
    getP()
  }, [])

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
  }, [storeCategories])

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
    tones,
    defaultValues,
    imgsOld,
    setImgsOld,
    images,
    setImages
  }
}