"use client"

import { Order } from "@/types/db/db"
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { removeStorage } from "@/utils/orders-storage"
import { useOrderForm } from "@/hooks/admin/orders/use-order-form"
import { OrderForm } from "../admin/orders/order-form"
import { ProductsContainer } from "./products-container"
import { useEffect, useState } from "react"
import { getCart } from "@/utils/cart"
import { ProductsSummary } from "../common/products-summary"
import { ButtonWithIcon } from "../common/button-with-icon"
import { Store } from "../common/icons"
import { Popup } from "../common/popup"
import { Button } from "../common/button"

export const OrderFormCart = ({
  className, id, colorDefault
}: {
  className?: string,
  id?: string,
  colorDefault?: string
}) => {
  const [popup, setPopup] = useState(false)
  const router = useRouter()
  const [loadingProducts, setLoadingProducts] = useState(true)
  const {
    products, errorDiscountCode, errorProducts, errorSubmit,
    loadingCode, errors, handleClickDiscountCode, handleSubmit,
    loading, register, setProducts, setErrorProducts,
    setErrorDiscountCode, setErrorSubmit
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
        let subTotal = 0
        let total = 0
        let productsParser = ""

        for (let i = 0; i < products.length; i++) {
          const product = products[i]
          subTotal += product.price * product.amount
          let discount = 0

          if (product.discountCode) {
            discount = parseInt((product.price * product.amount * ((100 - product.discountCode.discount) / 100)).toFixed(0))
            total += discount
          } else {
            total += product.price * product.amount
          }

          productsParser += `%0A      ${i + 1}. ${product.name} x ${product.amount} = $${product.price * product.amount}
          ${product.tone ? `%0A         Tono: ${product.tone.name}` : ""}
          %0A         Precio: $${product.price}
          ${product.discountCode ? `%0A         Descuento: ${product.discountCode.code} - ${product.discountCode.discount}%25` : ""}
          ${discount > 0 ? `%0A         Total: $${discount}` : ""}
          `
        }

        removeStorage()
        const message = `¡Hola Bonita Maquillaje! 👋
          %0AEste es el resumen de mi pedido:
          %0A   
          %0A   Fecha: ${order.create_at.toDate().toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
          %0A   Nombre del cliente: ${order.name}
          %0A   Telefono: ${order.phone}
          %0A   Email: ${order.email}
          %0A   Departamento: ${order.department}
          %0A   Ciudad: ${order.city}
          %0A   Dirección: ${order.address}
          %0A   Forma de Pago: ${order.paymentMethod}
          %0A   Cantidad de Productos: ${products.length}
          %0A   
          %0A   Productos:
          ${productsParser}
          %0A   
          %0A   Subtotal: $${parseInt(subTotal.toFixed(0))}
          %0A   Total: $${parseInt(total.toFixed(0))}
        `
        const url = `https://api.whatsapp.com/send?phone=57${process.env.NEXT_PUBLIC_PHONE_NUMBER}&text=${message}`

        if (window) {
          window.open(url, '_blank')
        }

        setPopup(true)
      } catch (err) {
        console.log(err)
        setErrorSubmit("Error al crear el pedido")
      }
    }
  })

  useEffect(() => {
    if (products.length !== 0) return

    const getC = async () => {
      setLoadingProducts(true)
      let cart = await getCart()

      if (id) {
        if (colorDefault) {
          cart = cart.filter(product => product.id === id && product.tone?.color === colorDefault)
        } else{
          cart = cart.filter(product => product.id === id)
        }
      }

      setProducts(cart)
      setLoadingProducts(false)
    }
    getC()
  }, [])

  return (
    <>
      {
        !loadingProducts && products.length === 0 ? (
          <section className="flex flex-col items-center justify-center gap-3">
            <p className="text-text-100 font-light">No hay productos en el carrito :(</p>
            <ButtonWithIcon href="/catalogo">
              <Store className="stroke-text-200" />
              Seguir comprando productos
            </ButtonWithIcon>
          </section>
        ) : (
          <section className={`flex flex-col-reverse gap-4 max-w-lg mx-auto lg:grid lg:grid-cols-2 lg:gap-6 lg:max-w-none ${className}`}>
            <article className="mt-3 lg:mt-0">
              <OrderForm
                textButton="Realizar pedido"
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
            <aside>
              <ProductsContainer
                skeletons={id ? 1 : 2}
                loading={loadingProducts}
                products={products}
                setProducts={setProducts}
              />
              {errorProducts && <p className="text-red-500 font-light px-3.5 mt-4 text-sm">{errorProducts}</p>}
              <ProductsSummary products={products} className="mt-5" />
            </aside>
            {
              popup && (
                <Popup>
                  <div className="flex flex-col items-center justify-center gap-4 p-4 bg-bg-50 shadow-button rounded-lg">
                    <p className="text-text-100 text-lg">¡Gracias por tu pedido!</p>
                    <Button
                      onClick={() => {
                        setPopup(false)
                        router.push("/catalogo")
                      }}
                    >
                      Seguir comprando
                    </Button>
                  </div>
                </Popup>
              )
            }
          </section>
        )
      }
    </>
  )
}