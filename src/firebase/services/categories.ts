import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore"
import { db } from "../initializeApp"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { Category, Id } from "@/types/db/db"
import { filterPublicCategories } from "@/lib/category-filter"
import { sortCategories } from "@/lib/category-order"
import { getAppEnv } from "@/lib/env"

export const getCategories = async () => {
  const querySnapshot = await getDocs(collection(db, ROUTES_COLLECTIONS.CATEGORIES))
  const categories: Category[] = []

  querySnapshot.forEach(doc => {
    categories.push({ ...doc.data(), id: doc.id } as Category)
  })

  return sortCategories(categories)
}

export const getPublicCategories = async () => {
  const categories = await getCategories()
  return filterPublicCategories(categories, getAppEnv())
}

export const getCategory = async (id: string) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.CATEGORIES, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as Category
  } else {
    return null
  }
}

export const saveCategory = async (category: Category) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.CATEGORIES, category.id)
  await setDoc(docRef, category)
}

export const deleteCategory = async (id: Id) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.CATEGORIES, id)
  await deleteDoc(docRef)
}

export const updateCategory = async (category: Category) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.CATEGORIES, category.id)
  await updateDoc(docRef, { ...category })
}