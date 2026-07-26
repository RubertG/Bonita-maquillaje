import { z } from "zod/v4"

export const bannerSchema = z.object({
  alt: z.string().trim().min(1, {
    message: "El texto alternativo es obligatorio"
  })
})
