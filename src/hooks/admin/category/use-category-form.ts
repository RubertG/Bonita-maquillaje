"use client"

import { useRouter } from "next/navigation"
import { BaseSyntheticEvent, useEffect, useState } from "react"
import { useForm } from "../../common/use-form"
import { categorySchema } from "@/validations/admin/products/category"
import { deleteFile, saveFile } from "@/firebase/services/storage"
import { v4 as uuidv4 } from "uuid"
import { deleteCategory, getCategory, saveCategory, updateCategory } from "@/firebase/services/categories"
import { CategoryInputs, FileStateItem } from "@/types/admin/admin"
import { Category } from "@/types/db/db"
import { useStoreCategory } from "@/stores/common/category.store"

export const useCategoryForm = (id?: string) => {
  const [defaultValues, setDefaultValues] = useState<CategoryInputs>({
    name: ""
  })
  const [imgOld, setImgOld] = useState<FileStateItem[]>([])
  const [imgs, setImgs] = useState<File[]>([])
  const [errorImgs, setErrorImgs] = useState("")
  const [error, setError] = useState("")
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [popup, setPopup] = useState(false)
  
  const addCategory = useStoreCategory(state => state.addCategory)
  const updateStoreCategory = useStoreCategory(state => state.updateCategory)
  const deleteStoreCategory = useStoreCategory(state => state.deleteCategory)

  const router = useRouter()
  const { errors, handleSubmit, loading, register } = useForm<CategoryInputs>({
    schema: categorySchema,
    values: defaultValues,
    actionSubmit: async (data) => {
      setError("")
      setErrorImgs("")

      if (imgs.length === 0 && imgOld.length === 0) {
        setErrorImgs("Se requiere cargar imagenes")
        return
      }

      try {
        let imgRef = ""
        let category: Category = {
          name: data.name,
          id: uuidv4(),
          img: {
            name: "",
            url: "",
            size: 0
          }
        }

        if (imgs.length > 0) {
          imgRef = await saveFile(imgs[0], "/categories")
          category = {
            ...category,
            img: {
              name: imgs[0].name,
              url: imgRef,
              size: imgs[0].size
            }
          }
        } else {
          category = {
            ...category,
            img: imgOld[0]
          }
        }

        if (id) {
          const newCategory = {
            ...category,
            id
          }
          updateStoreCategory(newCategory)
          await updateCategory(newCategory)
        } else {
          addCategory(category)
          await saveCategory(category)
        }

        router.push("/admin/productos")
        router.refresh()
      } catch (error) {
        console.log(error)
        setError("Ocurrio un error al cargar la categoría")
      }
    }
  })

  useEffect(() => {
    setImgOld([])
    setImgs([])
    setErrorImgs("")
    setError("")
    
    if (id) {

      const getC = async () => {
        const category = await getCategory(id)

        if (!category) return

        setImgOld([category.img])
        setDefaultValues({
          name: category.name
        })
      }
      getC()
      return
    }

    setDefaultValues({ name: "" })
  }, [id])

  useEffect(() => {
    if (imgs.length > 0) setErrorImgs("")
  }, [imgs])

  const onSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()

    if (imgs.length === 0 && imgOld.length === 0) {
      setErrorImgs("Se requiere cargar imagenes")
    }

    await handleSubmit(e)
  }

  const handleDelete = async () => {
    if (!id) return

    setLoadingDelete(true)

    deleteStoreCategory(id)
    if (imgOld.length > 0) {
      await Promise.all([
        await deleteFile(`categories/${imgOld[0].name}`),
        await deleteCategory(id)
      ])
    } else {
      await deleteCategory(id)
    }

    setImgOld([])
    setImgs([])
    router.push("/admin/categorias")
    router.refresh()
    setLoadingDelete(false)
    setPopup(false)
  }

  const handlePopup = () => setPopup(!popup)

  return {
    error,
    errorImgs,
    errors,
    imgs,
    loading,
    onSubmit,
    register,
    setImgs,
    imgOld,
    popup,
    loadingDelete,
    handlePopup,
    handleDelete,
    setImgOld
  }
}
