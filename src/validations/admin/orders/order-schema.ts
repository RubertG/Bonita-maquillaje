import { z } from "zod"

export const orderSchema = z.object({
  name: z.string().min(5, {
    message: "El nombre debe ser mayor a 5 caracteres"
  }),
  department: z.string().min(1, {
    message: "El departamento es requerido"
  }),
  city: z.string().min(1, {
    message: "La ciudad es requerida"
  }),
  address: z.string().min(1, {
    message: "La dirección es requerida"
  }),
  email: z.string().email({
    message: "Por favor ingrese un correo valido"
  }),
  paymentMethod: z.string().min(1, {
    message: "El método de pago es requerido"
  }),
  phone: z.string().min(10, {
    message: "El número de celular debe tener 10 caracteres"
  }).max(10, {
    message: "El número de celular debe tener 10 caracteres"
  })
})