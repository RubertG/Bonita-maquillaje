// Canonical category order shared by scripts/seed-categories.ts and
// scripts/backfill-category-order.ts. Side-effect-free on purpose: no `dotenv`,
// no Firebase Admin SDK initialization at import time, so importing this module
// never triggers the credential guards or `process.exit(1)` calls that live at
// the top of seed-categories.ts.

export interface CanonicalCategory {
  id: string
  name: string
  imageFile: string
  isStagingOnly: boolean
}

export const CANONICAL_CATEGORIES: CanonicalCategory[] = [
  { id: "cajas-de-maquillaje", name: "Cajas de maquillaje", imageFile: "cajas-de-maquillaje.webp", isStagingOnly: false },
  { id: "cuidado-facial", name: "Cuidado facial", imageFile: "cuidado-facial.webp", isStagingOnly: false },
  { id: "bases-y-correctores", name: "Bases y correctores", imageFile: "bases-y-correctores.webp", isStagingOnly: false },
  { id: "polvos-sueltos-y-compactos", name: "Polvos sueltos y compactos", imageFile: "polvos-sueltos-y-compactos.webp", isStagingOnly: false },
  { id: "bronzer-y-contornos", name: "Bronzer y contornos", imageFile: "bronzer-y-contornos.webp", isStagingOnly: false },
  { id: "sombras", name: "Sombras", imageFile: "sombras.webp", isStagingOnly: false },
  { id: "rubor-e-iluminador", name: "Rubor e iluminador", imageFile: "rubor-e-iluminador.webp", isStagingOnly: false },
  { id: "labios", name: "Labios", imageFile: "labios.webp", isStagingOnly: false },
  { id: "ojos", name: "Ojos", imageFile: "ojos.webp", isStagingOnly: false },
  // The artwork is named after the sheet's "PRIMER Y FIJADOR" wording, while the
  // category id keeps the order the codebase already uses.
  { id: "fijador-y-primer", name: "Fijador y primer", imageFile: "primer-y-fijador.webp", isStagingOnly: false },
  { id: "brochas", name: "Brochas", imageFile: "brochas.webp", isStagingOnly: false },
  { id: "accesorios-de-maquillaje", name: "Accesorios de maquillaje", imageFile: "accesorios-de-maquillaje.webp", isStagingOnly: false }
]
