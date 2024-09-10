import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe ser mayor a 3 caracteres"
  })
})