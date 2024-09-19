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
    orders: Order[] | undefined
    filterOrders: Order[] | undefined
  }>(() => {
    const orders = localStorage.getItem(state ? "sales" : "orders")
    if (!orders) return {
      orders: [],
      filterOrders: []
    }
    try {
      return {
        orders: JSON.parse(orders) || [],
        filterOrders: JSON.parse(orders) || []
      }
    } catch (error) {
      console.error("Error parsing orders from localStorage", error)
      return {
        orders: [],
        filterOrders: []
      }
    }
  })

  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData, DocumentData> | undefined>(() => {
    const lastVisible = localStorage.getItem(state ? "salesLastVisible" : "ordersLastVisible")
    if (!lastVisible) return undefined
    try {
      return JSON.parse(lastVisible)
    } catch (error) {
      console.error("Error parsing lastVisible from localStorage", error)
      return undefined
    }
  })

  const [hasNext, setHasNext] = useState(() => {
    const hasNext = localStorage.getItem(state ? "salesHasNext" : "ordersHasNext")
    if (!hasNext) return false
    try {
      return JSON.parse(hasNext)
    } catch (error) {
      console.error("Error parsing hasNext from localStorage", error)
      return false
    }
  })

  const [loading, setLoading] = useState(false)
  const [reload, setReload] = useState(false)
  const [count, setCount] = useState(() => {
    const count = localStorage.getItem(state ? "salesCount" : "ordersCount")
    if (!count) return 0
    try {
      return JSON.parse(count)
    } catch (error) {
      console.error("Error parsing count from localStorage", error)
      return 0
    }
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
    if (!orders || !orders.orders || orders.orders.length === 0) {
      getOrders()
      return
    }

    if (!search) {
      setOrders({
        ...orders,
        filterOrders: JSON.parse(JSON.stringify(orders.orders) || "[]")
      })
      return
    }

    const handleSearch = async () => {
      setLoading(true)

      if (!orders.orders) return 

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
      setOrders({
        orders: undefined,
        filterOrders: undefined
      })
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
      setOrders({
        orders: undefined,
        filterOrders: undefined
      })
    }

    const h = o.length === LIMIT_ORDERS_PER_PAGE
    const newOrders = [...(orders?.orders || []), ...o]
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
