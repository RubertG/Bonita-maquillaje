import { getCategories } from "@/firebase/services/categories"
import { BackButton } from "../common/back-button"

interface Props {
  href?: string
}

export const BackButtonCategory = async ({ href = "/catalogo"}: Props) => {
  const categories = await getCategories()

  if (!categories) return (
    <BackButton href={href} />
  )
 
  return (
    <BackButton href={`${href}?categoria=${categories[0].id}`} />
  )
} 