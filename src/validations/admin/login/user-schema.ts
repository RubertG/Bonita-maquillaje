import { z } from "zod/v4"

export const userSchema = z.object({
  email: z.string().email({
    message: "Por favor ingrese un correo valido"
  }),
  password: z.string().min(6, {
    message: "La contrasena debe ser mayor a 6 caracteres"
  })
})