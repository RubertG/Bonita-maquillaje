"use client"

import { LIMIT_ORDERS_PER_PAGE } from "@/consts/admin/orders"
import { getCountOrders, getFirstOrders, getNextOrders } from "@/firebase/services/orders"
import { Order } from "@/types/db/db"
import { removeStorage, setStorage } from "@/utils/orders-storage"
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export const useOrders = (state: boolean = false) => {
  const [orders, setOrders] = useState<{
    orders: Order[]
    filterOrders: Order[]
  } | undefined>(() => {
    const orders = localStorage.getItem(state ? "sales" : "orders")
    if (!orders) return {
      orders: [],
      filterOrders: []
    }
    return {
      orders: JSON.parse(orders),
      filterOrders: JSON.parse(orders)
    }
  })
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData, DocumentData> | undefined>(() => {
    const lastVisible = localStorage.getItem(state ? "salesLastVisible" : "ordersLastVisible")
    if (!lastVisible) return undefined
    return JSON.parse(lastVisible)
  })
  const [hasNext, setHasNext] = useState(() => {
    const hasNext = localStorage.getItem(state ? "salesHasNext" : "ordersHasNext")
    if (!hasNext) return false
    return JSON.parse(hasNext)
  })
  const [loading, setLoading] = useState(false)
  const [reload, setReload] = useState(false)
  const [count, setCount] = useState(() => {
    const count = localStorage.getItem(state ? "salesCount" : "ordersCount")

    if (!count) return 0
    
    return JSON.parse(count)
  })
  const searchParams = useSearchParams()
  const router = useRouter()
  const search = searchParams.get("busqueda")

  useEffect(() => {
    if (reload) {
      getOrders()
      setReload(false)
    }
  }, [reload])

  useEffect(() => {
    window.addEventListener('beforeunload', () => removeStorage(state))

    return () => {
      window.removeEventListener('beforeunload', () => removeStorage(state))
    }
  }, [])

  useEffect(() => {
    if (!orders || orders.orders.length === 0) {
      getOrders()
      return
    }

    if (!search) {
      setOrders({
        ...orders,
        filterOrders: JSON.parse(JSON.stringify(orders.orders))
      })
      return
    }

    const handleSearch = async () => {
      setLoading(true)
      const newOrders = orders?.orders.filter(order => order.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))

      if (!newOrders) {
        setOrders({
          ...orders,
          filterOrders: []
        })
      }

      setOrders({
        ...orders,
        filterOrders: newOrders
      })

      removeStorage(state)
      setLoading(false)
    }

    handleSearch()
  }, [search])

  const getCount = async () => {
    const count = await getCountOrders(state)
    setCount(count)
    return count
  }

  const getOrders = async () => {
    setLoading(true)
    const { orders: o, lastVisible: l } = await getFirstOrders(state)

    if (!o) {
      setOrders(undefined)
    } else {
      if (search) {
        const newOrders = o.filter(order => order.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
        setOrders({
          orders: o,
          filterOrders: newOrders
        })
      } else {
        setOrders({
          orders: o,
          filterOrders: o
        })
      }
    }

    const h = o.length === LIMIT_ORDERS_PER_PAGE
    const count = await getCount()
    setStorage(o, l, h, state, count)
    setLastVisible(l)
    setHasNext(h)
    setLoading(false)
  }



  const getMoreOrders = async () => {
    if (!lastVisible || !orders) return

    router.replace(`/admin/${state ? "ventas" : "pedidos"}`)
    setLoading(true)
    const { orders: o, lastVisible: l } = await getNextOrders(lastVisible, state)

    if (!orders) {
      setOrders(undefined)
    }

    const h = o.length === LIMIT_ORDERS_PER_PAGE
    const newOrders = [...orders.orders, ...o]
    setOrders({
      orders: newOrders,
      filterOrders: newOrders
    })
    setLastVisible(l)
    setHasNext(h)
    setLoading(false)
  }

  return {
    orders,
    getMoreOrders,
    loading,
    setReload,
    hasNext,
    count
  }
}