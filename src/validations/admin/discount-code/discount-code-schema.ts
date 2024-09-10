import { z } from "zod"

export const discountCodeSchema = z.object({
  code: z.string().min(3, {
    message: "El código debe ser mayor a 3 caracteres"
  }),
  discount: z.string().min(1, {
    message: "El descuento es requerido"
  }).refine((value) => {
    return parseFloat(value) >= 0 && parseFloat(value) <= 100
  }, {
    message: "El descuento debe ser entre 0 y 100"
  }),
  category: z.string().min(1, {
    message: "La categoría es requerida"
  }),
  day: z.string().min(1, {
    message: "El dia es requerido"
  })
})