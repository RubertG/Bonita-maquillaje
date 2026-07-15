import { z } from "zod/v4"

export const toneSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe ser mayor a 3 caracteres"
  }),
  color: z.string().min(1, {
    message: "El color del tono es requerido"
  })
})