"use client"

import { ProductsForm } from "./products-form"
import { OrderForm } from "./order-form"
import { Order } from "@/types/db/db"
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from "firebase/firestore"
import { saveOrder } from "@/firebase/services/orders"
import { useRouter } from "next/navigation"
import { removeStorage } from "@/utils/orders-storage"
import { useOrderForm } from "@/hooks/admin/orders/use-order-form"

export const CreateOrderForm = () => {
  const router = useRouter()
  const {
    products, errorDiscountCode, errorProducts, errorSubmit,
    loadingCode, errors, handleClickDiscountCode, handleSubmit,
    loading, register, setProducts, setErrorProducts,
    setErrorDiscountCode, searchedProducts, setErrorSubmit, setSearchedProducts
  } = useOrderForm({
    actionSubmit: async (inputs) => {
      if (products.length === 0) {
        setErrorProducts("Se requiere cargar al menos un producto")
        return
      }

      try {
        const order: Order = {
          ...inputs,
          id: uuidv4(),
          products: products.map(p => ({
            id: p.id,
            amount: p.amount,
            ...(p.discountCode ? { discountCode: p.discountCode } : {}),
            ...(p.tone ? { tone: p.tone } : {})
          })),
          create_at: Timestamp.now(),
          phone: Number(inputs.phone),
          state: false
        }
        await saveOrder(order)
        removeStorage()
        router.push("/admin/pedidos")
      } catch (err) {
        setErrorSubmit("Error al crear el pedido")
      }
    }
  })

  return (
    <section className="flex flex-col-reverse gap-4 max-w-lg mx-auto lg:grid lg:grid-cols-2 lg:gap-6 lg:max-w-none">
      <article className="mt-3 lg:mt-0">
        <OrderForm
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