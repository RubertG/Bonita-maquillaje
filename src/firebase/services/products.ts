import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore"
import { db } from "../initializeApp"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { Id, Product } from "@/types/db/db"

interface Query {
  category: Id
}

export const getProducts = async ({ category }: Query) => {
  const q = query(collection(db, ROUTES_COLLECTIONS.PRODUCTS),
    where('category', '==', category)
  )
  const querySnapshot = await getDocs(q)
  const products: Product[] = []

  querySnapshot.forEach(doc => {
    products.push(doc.data() as Product)
  })

  return products
}

export const getAllProducts = async (search?: string) => {
  const querySnapshot = await getDocs(collection(db, ROUTES_COLLECTIONS.PRODUCTS))
  const products: Product[] = []

  querySnapshot.forEach(doc => {
    if (search) {
      if (doc.data().name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) {
        products.push(doc.data() as Product)
      }
    } else {
      products.push(doc.data() as Product)
    }
  })

  return products
}

export const getProduct = async (id: string) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.PRODUCTS, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as Product
  } else {
    return null
  }
}

export const saveProduct = async (product: Product) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.PRODUCTS, product.id)
  await setDoc(docRef, product)
}

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.PRODUCTS, id)
  await deleteDoc(docRef)
}

export const updateProduct = async (product: Product) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.PRODUCTS, product.id)
  await updateDoc(docRef, { ...product })
}