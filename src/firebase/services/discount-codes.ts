import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, where } from "firebase/firestore"
import { db } from "../initializeApp"
import { DiscountCode, Id } from "@/types/db/db"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { getCategory } from "./categories"
import { ALL_CATEGORY } from "@/consts/admin/orders"

export const getDiscountCodes = async () => {
  const q = query(collection(db, ROUTES_COLLECTIONS.DISCOUNT_CODES), orderBy('expiration', 'desc'))
  const querySnapshot = await getDocs(q)
  const discountCodes: DiscountCode[] = []

  querySnapshot.forEach(doc => {
    discountCodes.push(doc.data() as DiscountCode)
  })

  const NewDiscountCode = await Promise.all(discountCodes.map(async (discountCode) => {
    if (discountCode.category === ALL_CATEGORY) return {
      ...discountCode,
      category: "Todas las categorías"
    }

    const category = await getCategory(discountCode.category)

    return {
      ...discountCode,
      category: category?.name || "Categoría no encontrada"
    }
  }))

  return NewDiscountCode
}

export const getDiscountCode = async (code: string) => {
  const collectionRef = collection(db, ROUTES_COLLECTIONS.DISCOUNT_CODES)
  const q = query(collectionRef, where('code', '==', code))
  const querySnapshot = await getDocs(q)
  const results: DiscountCode[] = []

  querySnapshot.forEach(doc => {
    results.push(doc.data() as DiscountCode)
  })

  return results.length > 0 ? results[0] : null
}

export const saveDiscountCode = async (discountCode: DiscountCode) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.DISCOUNT_CODES, discountCode.code)
  await setDoc(docRef, discountCode)
}

export const deleteDiscountCode = async (id: Id) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.DISCOUNT_CODES, id)
  await deleteDoc(docRef)
}