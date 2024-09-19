"use client"

import { SaleCard } from "./sale-card"
import { branch } from "@/fonts/branch/branch"
import { useOrders } from "@/hooks/admin/orders/use-orders"
import { OrderSkeleton } from "../orders/order-skeleton"

interface Props {
  className?: string
}

export const SalesContainer = ({
  className
}: Props) => {
  const {
    getMoreOrders, hasNext, loading,
    orders, setReload, count
  } = useOrders(true)

  if (!orders || !orders.filterOrders || !orders.orders || orders.filterOrders.length === 0) return (
    <section className={`${className} text-center text-text-300 mt-4`}>
      No se encontraron pedidos 
    </section>
  )

  return (
    <section className={className}>
      {
        !loading && (
          <p className="text-text-300 font-light text-end">
            <span className="font-normal">{count}</span> {count === 1 ? "venta" : "ventas"}
          </p>
        )
      }
      <ul className={`${className} grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-2`}>
        {
          (
            orders.filterOrders.map((order) => (
              <SaleCard
                key={order.id}
                setReload={setReload}
                {...order}
              />
            ))
          )
        }
        {
          loading && (
            Array(6).fill(0).map((_, index) => (
              <OrderSkeleton key={index} />
            ))
          )
        }
      </ul>
      {
        hasNext && !loading && (
          <footer
            className="flex justify-end items-center mt-7"
          >
            <button
              className={`relative inline-flex items-center justify-center py-2 px-3.5 rounded-lg bg-accent-200 text-text-100 gap-2 text-center text-xl shadow-button lg:hover:bg-principal-100 lg:transition-colors ${branch.className}`}
              onClick={getMoreOrders}
            >
              Ver más pedidos
            </button>
          </footer>
        )
      }
    </section>
  )
}