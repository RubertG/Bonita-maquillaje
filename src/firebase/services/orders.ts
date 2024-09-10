import { collection, deleteDoc, doc, DocumentData, getCountFromServer, getDoc, getDocs, limit, orderBy, query, QueryDocumentSnapshot, setDoc, startAfter, updateDoc, where } from "firebase/firestore"
import { db } from "../initializeApp"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { Order, Product as ProductDB } from "@/types/db/db"
import { LIMIT_ORDERS_PER_PAGE } from "@/consts/admin/orders"

export const getCountOrders = async (state: boolean) => {
  const q = query(collection(
    db, ROUTES_COLLECTIONS.ORDERS),
    where("state", "==", state)
  )
  const querySnapshot = await getCountFromServer(q)
  return querySnapshot.data().count  
}

export const getFirstOrders = async (state: boolean) => {
  const q = query(collection(
    db, ROUTES_COLLECTIONS.ORDERS),
    orderBy("create_at", "desc"),
    where("state", "==", state),
    limit(LIMIT_ORDERS_PER_PAGE)
  )
  const querySnapshot = await getDocs(q)
  const orders: Order[] = []

  querySnapshot.forEach(doc => {
    orders.push(doc.data() as Order)
  })

  return {
    orders,
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
  }
}

export const getNextOrders = async (lastVisible: QueryDocumentSnapshot<DocumentData, DocumentData>, state: boolean) => {
  const q = query(collection(
    db, ROUTES_COLLECTIONS.ORDERS),
    orderBy('create_at', 'desc'),
    where("state", "==", state),
    limit(LIMIT_ORDERS_PER_PAGE),
    startAfter(lastVisible)
  )
  const querySnapshot = await getDocs(q)
  const orders: Order[] = []

  querySnapshot.forEach(doc => {
    orders.push(doc.data() as Order)
  })

  return {
    orders,
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
    hasNext: querySnapshot.size === 20
  }
}

export const getOrder = async (id: string) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.ORDERS, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const order = docSnap.data() as Order
    const productsOrder = await Promise.all(order.products.map(async (product) => {
      const productRef = doc(db, ROUTES_COLLECTIONS.PRODUCTS, product.id)
      const productSnap = await getDoc(productRef)
      const productData = productSnap.data() as ProductDB

      if (!productData) return null

      return {
        ...productData,
        ...product
      }
    }))

    return {
      ...order,
      products: productsOrder.filter(product => product !== null)
    }
  } else {
    return null
  }
}

export const saveOrder = async (order: Order) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.ORDERS, order.id)
  await setDoc(docRef, order)
}

export const deleteOrder = async (id: string) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.ORDERS, id)
  await deleteDoc(docRef)
}

export const updateOrder = async (order: Order) => {
  const docRef = doc(db, ROUTES_COLLECTIONS.ORDERS, order.id)
  await updateDoc(docRef, { ...order })
}