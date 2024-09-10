import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe ser mayor a 3 caracteres"
  }),
  category: z.string().min(1, {
    message: "Selecciona una categoría"
  }),
  description: z.string().min(1, {
    message: "La descripción del producto es requerida"
  }),
  price: z.string().min(1, {
    message: "El precio es requerido"
  }),
  stock: z.string().min(1, {
    message: "El stock es requerido"
  })
})