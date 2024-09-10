import { getCategories } from "@/firebase/services/categories"
import { BackButton } from "../common/back-button"

export const BackButtonCategory = async () => {
  const categories = await getCategories()

  if (!categories) return (
    <BackButton href={"/catalogo"} />
  )
 
  return (
    <BackButton href={`/catalogo?categoria=${categories[0].id}`} />
  )
} 