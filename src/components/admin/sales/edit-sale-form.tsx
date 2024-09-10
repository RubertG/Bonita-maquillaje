"use client"

import { InputsOrders } from "@/types/admin/admin"
import { useEffect, useState } from "react"
import { Order } from "@/types/db/db"
import { Timestamp } from "firebase/firestore"
import { getOrder, updateOrder } from "@/firebase/services/orders"
import { useRouter } from "next/navigation"
import { removeStorage } from "@/utils/orders-storage"
import { useOrderForm } from "@/hooks/admin/orders/use-order-form"
import { OrderForm } from "../orders/order-form"
import { ProductsForm } from "../orders/products-form"

export const EditSaleForm = ({
  id
}: {
  id: string
}) => {
  const [create_at, setCreateAt] = useState<Timestamp>(Timestamp.now())
  const router = useRouter()
  const [defaultValues, setDefaultValues] = useState<InputsOrders>({
    address: "",
    city: "",
    department: "",
    email: "",
    name: "",
    paymentMethod: "",
    phone: ""
  })
  const {
    errors, handleSubmit, loading, register,
    errorDiscountCode, errorProducts, errorSubmit, handleClickDiscountCode,
    loadingCode, products, setProducts, searchedProducts, setSearchedProducts,
    setErrorProducts, setErrorSubmit, setErrorDiscountCode
  } = useOrderForm({
    defaultValues,
    actionSubmit: async (inputs) => {
      if (products.length === 0) {
        setErrorProducts("Se requiere cargar al menos un producto")
        return
      }

      try {
        const order: Order = {
          ...inputs,
          id,
          products: products.map(p => ({
            id: p.id,
            amount: p.amount,
            ...(p.discountCode ? { discountCode: p.discountCode } : {}),
            ...(p.tone ? { tone: p.tone } : {})
          })),
          create_at: create_at,
          phone: Number(inputs.phone),
          state: true
        }
        await updateOrder(order)
        removeStorage(true /* state */)
        router.push("/admin/ventas")
      } catch (err) {
        setErrorSubmit("Error al guardar la venta")
      }
    }
  })

  useEffect(() => {
    const getO = async () => {
      const order = await getOrder(id)

      if (!order) {
        router.push("/admin/ventas")
        return
      }

      setDefaultValues({
        address: order.address,
        city: order.city,
        department: order.department,
        email: order.email,
        name: order.name,
        paymentMethod: order.paymentMethod,
        phone: String(order.phone)
      })
      setCreateAt(order.create_at)
      setProducts(order.products)
    }

    getO()
  }, [])

  return (
    <section className="flex flex-col-reverse gap-4 max-w-lg mx-auto lg:grid lg:grid-cols-[50%_50%] lg:gap-6 lg:max-w-none">
      <article className="mt-3 lg:mt-0">
        <OrderForm
          textButton="Guardar venta"
          errors={errors}
          loading={loading}
          handleClickDiscountCode={handleClickDiscountCode}
          loadingCode={loadingCode}
          errorDiscountCode={errorDiscountCode}
          setErrorDiscountCode={setErrorDiscountCode}
          handleSubmit={handleSubmit}
          register={register} />
        {errorSubmit && <p className="text-red-500 font-light px-3.5 -mt-3 text-sm">{errorSubmit}</p>}
      </article>
      <aside className="lg:mt-8">
        <ProductsForm
          products={products}
          setProducts={setProducts}
          searchedProducts={searchedProducts}
          setSearchedProducts={setSearchedProducts}
        />
        {errorProducts && <p className="text-red-500 font-light px-3.5 mt-4 text-sm">{errorProducts}</p>}
      </aside>
    </section>
  )
}