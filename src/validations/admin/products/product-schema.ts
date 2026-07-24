import { z } from "zod/v4"

function nullIfEmpty(value: unknown) {
  if (value === "" || value == null || Number.isNaN(value)) return null
  return Number(value)
}

function zeroIfEmpty(value: unknown) {
  if (value === "" || value == null || Number.isNaN(value)) return 0
  return Number(value)
}

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
  price: z.coerce.number().min(1, {
    message: "El precio es requerido y debe ser mayor a 0"
  }),
  stock: z.coerce.number().int().min(1, {
    message: "El stock es requerido y debe ser mayor a 0"
  }),
  offerPrice: z.preprocess(
    nullIfEmpty,
    z.number().min(0, {
      message: "El precio de oferta debe ser mayor o igual a 0"
    }).optional().nullable()
  ),
  isBestSeller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  salesCount: z.preprocess(
    zeroIfEmpty,
    z.number().int().min(0).default(0)
  )
}).refine((data) => {
  if (data.offerPrice == null) return true
  return data.offerPrice < data.price
}, {
  message: "El precio de oferta debe ser menor al precio normal",
  path: ["offerPrice"]
})
