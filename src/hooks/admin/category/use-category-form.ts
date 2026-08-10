"use client"

import { useRouter } from "next/navigation"
import { BaseSyntheticEvent, useEffect, useState } from "react"
import { useForm } from "../../common/use-form"
import { categorySchema } from "@/validations/admin/products/category"
import { deleteFile, saveFile } from "@/firebase/services/storage"
import { v4 as uuidv4 } from "uuid"
import { getCategory } from "@/firebase/services/categories"
import {
  createCategory,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction
} from "@/app/actions/admin/categories"
import { getAuthToken } from "@/lib/auth-token"
import { nextCategoryOrder } from "@/lib/category-order"
import { CategoryInputs, FileStateItem } from "@/types/admin/admin"
import { Category } from "@/types/db/db"
import { useStoreCategory } from "@/stores/common/category.store"

export const useCategoryForm = (id?: string) => {
  const [defaultValues, setDefaultValues] = useState<CategoryInputs>({
    name: "",
    isStagingOnly: false
  })
  const [imgOld, setImgOld] = useState<FileStateItem[]>([])
  const [imgs, setImgs] = useState<File[]>([])
  const [errorImgs, setErrorImgs] = useState("")
  const [error, setError] = useState("")
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [popup, setPopup] = useState(false)
  const [existingOrder, setExistingOrder] = useState<number | undefined>(undefined)

  const addCategory = useStoreCategory(state => state.addCategory)
  const updateStoreCategory = useStoreCategory(state => state.updateCategory)
  const deleteStoreCategory = useStoreCategory(state => state.deleteCategory)

  const router = useRouter()
  const { errors, handleSubmit, loading, register, setValue, watch } = useForm<CategoryInputs>({
    schema: categorySchema,
    values: defaultValues,
    actionSubmit: async (data) => {
      setError("")
      setErrorImgs("")

      try {
        const categoryId = id ?? uuidv4()
        let category: Category = {
          name: data.name,
          id: categoryId,
          img: {
            name: "",
            url: "",
            size: 0
          },
          isStagingOnly: data.isStagingOnly
        }

        if (imgs.length > 0) {
          const { url, name } = await saveFile(imgs[0], categoryId, "/categories")
          category = {
            ...category,
            img: {
              name,
              url,
              size: imgs[0].size
            }
          }
        } else if (imgOld.length > 0) {
          category = {
            ...category,
            img: imgOld[0]
          }
        }

        // `order` is added as a key only when it is a number: the Admin SDK
        // rejects `undefined` values, and omitting the key lets
        // `.set(..., { merge: true })` keep whatever Firestore already holds.
        const order = id
          ? existingOrder
          : nextCategoryOrder(useStoreCategory.getState().categories)

        if (typeof order === "number") category = { ...category, order }

        const token = await getAuthToken()

        if (id) {
          updateStoreCategory(category)
          const result = await updateCategoryAction(token, category)
          if (!result.ok) {
            throw new Error(result.error)
          }
        } else {
          addCategory(category)
          const result = await createCategory(token, category)
          if (!result.ok) {
            throw new Error(result.error)
          }
        }

        router.push("/admin/productos")
        router.refresh()
      } catch (error) {
        setError("Ocurrio un error al cargar la categoría")
      }
    }
  })

  useEffect(() => {
    setImgOld([])
    setImgs([])
    setErrorImgs("")
    setError("")
    // Stale is worse than absent here: without this reset, editing category A
    // (order: 3), switching to category B before B's fetch resolves, and
    // submitting would still carry A's `existingOrder` and overwrite B's order.
    setExistingOrder(undefined)

    if (id) {

      const getC = async () => {
        const category = await getCategory(id)

        if (!category) return

        setImgOld([category.img])
        setDefaultValues({
          name: category.name,
          isStagingOnly: category.isStagingOnly ?? false
        })
        setExistingOrder(category.order)
      }
      getC()
      return
    }

    setDefaultValues({ name: "", isStagingOnly: false })
  }, [id])

  useEffect(() => {
    if (imgs.length > 0) setErrorImgs("")
  }, [imgs])

  const onSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault()

    await handleSubmit(e)
  }

  const handleDelete = async () => {
    if (!id) return

    setLoadingDelete(true)

    deleteStoreCategory(id)
    const token = await getAuthToken()
    const deleteCategoryPromise = deleteCategoryAction(token, id)
    if (imgOld.length > 0 && imgOld[0].url) {
      await Promise.all([
        deleteFile(imgOld[0].url),
        deleteCategoryPromise
      ])
    } else {
      await deleteCategoryPromise
    }

    setImgOld([])
    setImgs([])
    router.push("/admin/categorias")
    router.refresh()
    setLoadingDelete(false)
    setPopup(false)
  }

  const handlePopup = () => setPopup(!popup)

  const isStagingOnly = watch("isStagingOnly")
  const setIsStagingOnly = (value: boolean) => setValue("isStagingOnly", value)

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
    setImgOld,
    isStagingOnly,
    setIsStagingOnly
  }
}
